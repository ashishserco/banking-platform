// Integration Tests for Banking Platform API
// Comprehensive API testing with Newman/Postman

const newman = require('newman');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
    environment: process.env.TEST_ENVIRONMENT || 'dev',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
    retries: parseInt(process.env.TEST_RETRIES) || 3
};

console.log('🧪 Banking Platform Integration Tests');
console.log(`Environment: ${config.environment}`);
console.log(`Base URL: ${config.baseUrl}`);
console.log('=====================================');

// Test collections
const testCollections = [
    {
        name: 'Account Service Tests',
        collection: path.join(__dirname, 'collections/account-service.json'),
        environment: path.join(__dirname, 'environments', `${config.environment}.json`)
    },
    {
        name: 'Transaction Service Tests', 
        collection: path.join(__dirname, 'collections/transaction-service.json'),
        environment: path.join(__dirname, 'environments', `${config.environment}.json`)
    },
    {
        name: 'Payment Service Tests',
        collection: path.join(__dirname, 'collections/payment-service.json'),
        environment: path.join(__dirname, 'environments', `${config.environment}.json`)
    },
    {
        name: 'End-to-End Banking Flow',
        collection: path.join(__dirname, 'collections/e2e-banking-flow.json'),
        environment: path.join(__dirname, 'environments', `${config.environment}.json`)
    }
];

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Function to run a test collection
async function runTestCollection(testConfig) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔄 Running ${testConfig.name}...`);
        
        newman.run({
            collection: testConfig.collection,
            environment: testConfig.environment,
            globals: {
                values: [
                    { key: 'baseUrl', value: config.baseUrl },
                    { key: 'timeout', value: config.timeout }
                ]
            },
            reporters: ['cli', 'json'],
            reporter: {
                json: {
                    export: path.join(__dirname, 'results', `${testConfig.name.toLowerCase().replace(/\s+/g, '-')}-results.json`)
                }
            },
            timeout: config.timeout,
            timeoutRequest: config.timeout,
            timeoutScript: 5000,
            delayRequest: 100,
            ignoreRedirects: true,
            insecure: true
        }, (err, summary) => {
            if (err) {
                console.error(`❌ ${testConfig.name} failed:`, err);
                reject(err);
                return;
            }
            
            const stats = summary.run.stats;
            const testCount = stats.tests.total;
            const failures = stats.tests.failed;
            const passes = stats.tests.total - stats.tests.failed;
            
            totalTests += testCount;
            passedTests += passes;
            failedTests += failures;
            
            testResults.push({
                name: testConfig.name,
                total: testCount,
                passed: passes,
                failed: failures,
                duration: summary.run.timings.completed - summary.run.timings.started
            });
            
            if (failures > 0) {
                console.log(`❌ ${testConfig.name}: ${passes}/${testCount} tests passed (${failures} failed)`);
                
                // Log failure details
                summary.run.failures.forEach(failure => {
                    console.log(`   ❌ ${failure.source.name}: ${failure.error.message}`);
                });
            } else {
                console.log(`✅ ${testConfig.name}: All ${testCount} tests passed`);
            }
            
            resolve(summary);
        });
    });
}

// Function to wait for services to be ready
async function waitForServices() {
    console.log('⏳ Waiting for services to be ready...');
    
    const healthEndpoints = [
        `${config.baseUrl}/api/account/health`,
        `${config.baseUrl}/api/transaction/health`, 
        `${config.baseUrl}/api/payment/health`,
        `${config.baseUrl}/api/notification/health`
    ];
    
    const maxRetries = 30;
    const retryDelay = 5000;
    
    for (const endpoint of healthEndpoints) {
        let retries = 0;
        let isReady = false;
        
        while (retries < maxRetries && !isReady) {
            try {
                const fetch = require('node-fetch');
                const response = await fetch(endpoint, { timeout: 5000 });
                
                if (response.ok) {
                    console.log(`✅ ${endpoint} is ready`);
                    isReady = true;
                } else {
                    console.log(`⏳ ${endpoint} not ready (${response.status}), retrying...`);
                }
            } catch (error) {
                console.log(`⏳ ${endpoint} not ready (${error.message}), retrying...`);
            }
            
            if (!isReady) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retries++;
            }
        }
        
        if (!isReady) {
            throw new Error(`Service at ${endpoint} is not ready after ${maxRetries} attempts`);
        }
    }
    
    console.log('✅ All services are ready');
}

// Function to generate test report
function generateTestReport() {
    const report = {
        summary: {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            success_rate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
        },
        environment: config.environment,
        base_url: config.baseUrl,
        timestamp: new Date().toISOString(),
        results: testResults
    };
    
    // Create results directory if it doesn't exist
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Write test report
    const reportPath = path.join(resultsDir, 'integration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(report);
    const htmlReportPath = path.join(resultsDir, 'integration-test-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    console.log(`\n📊 Test Report Generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
    
    return report;
}

// Function to generate HTML report
function generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Banking Platform Integration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; border-radius: 5px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-badge { padding: 2px 8px; border-radius: 3px; color: white; }
        .passed { background-color: #4CAF50; }
        .failed { background-color: #f44336; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏦 Banking Platform Integration Test Report</h1>
        <p>Environment: ${report.environment} | Base URL: ${report.base_url}</p>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p><strong>Total Tests:</strong> ${report.summary.total}</p>
        <p><strong>Passed:</strong> <span class="success">${report.summary.passed}</span></p>
        <p><strong>Failed:</strong> <span class="error">${report.summary.failed}</span></p>
        <p><strong>Success Rate:</strong> ${report.summary.success_rate}%</p>
    </div>
    
    <h2>Test Results</h2>
    <table>
        <thead>
            <tr>
                <th>Test Suite</th>
                <th>Total</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Duration (ms)</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${report.results.map(result => `
                <tr>
                    <td>${result.name}</td>
                    <td>${result.total}</td>
                    <td>${result.passed}</td>
                    <td>${result.failed}</td>
                    <td>${result.duration}</td>
                    <td>
                        <span class="status-badge ${result.failed > 0 ? 'failed' : 'passed'}">
                            ${result.failed > 0 ? 'FAILED' : 'PASSED'}
                        </span>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
}

// Main execution
async function main() {
    try {
        // Wait for services to be ready
        await waitForServices();
        
        console.log('\n🚀 Starting integration tests...');
        
        // Run all test collections
        for (const testConfig of testCollections) {
            await runTestCollection(testConfig);
        }
        
        // Generate test report
        const report = generateTestReport();
        
        // Print final summary
        console.log('\n📊 Final Test Summary:');
        console.log('======================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${report.summary.success_rate}%`);
        
        // Exit with appropriate code
        if (failedTests > 0) {
            console.log('\n❌ Integration tests failed');
            process.exit(1);
        } else {
            console.log('\n✅ All integration tests passed');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('❌ Integration test execution failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { runTestCollection, waitForServices, generateTestReport };
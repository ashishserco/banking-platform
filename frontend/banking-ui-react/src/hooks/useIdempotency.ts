import { useState, useEffect } from 'react';
import { generateIdempotencyKey } from '@/utils/idempotency';

/**
 * Hook for managing idempotency keys in forms
 * Generates a new key on mount and provides methods to regenerate
 */
export const useIdempotency = () => {
    const [idempotencyKey, setIdempotencyKey] = useState<string>('');

    useEffect(() => {
        // Generate key on mount
        setIdempotencyKey(generateIdempotencyKey());
    }, []);

    const regenerateKey = () => {
        setIdempotencyKey(generateIdempotencyKey());
    };

    return {
        idempotencyKey,
        regenerateKey,
    };
};

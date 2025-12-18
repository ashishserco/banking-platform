{{/*
Expand the name of the chart.
*/}}
{{- define "banking-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "banking-platform.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "banking-platform.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "banking-platform.labels" -}}
helm.sh/chart: {{ include "banking-platform.chart" . }}
{{ include "banking-platform.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "banking-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "banking-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Service labels
*/}}
{{- define "banking-platform.serviceLabels" -}}
{{ include "banking-platform.labels" . }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "banking-platform.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "banking-platform.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create database connection string
*/}}
{{- define "banking-platform.databaseConnectionString" -}}
{{- $host := .Values.config.database.host -}}
{{- $port := .Values.config.database.port -}}
{{- $username := .Values.config.database.username -}}
{{- $password := .Values.config.database.password -}}
{{- printf "Host=%s;Port=%d;Database=%s;Username=%s;Password=%s;SSL Mode=Require;" $host $port .database $username $password -}}
{{- end }}

{{/*
Create Redis connection string
*/}}
{{- define "banking-platform.redisConnectionString" -}}
{{- $host := .Values.config.redis.host -}}
{{- $port := .Values.config.redis.port -}}
{{- if .Values.config.redis.password -}}
{{- printf "%s:%d,password=%s" $host $port .Values.config.redis.password -}}
{{- else -}}
{{- printf "%s:%d" $host $port -}}
{{- end -}}
{{- end }}

{{/*
Create image reference
*/}}
{{- define "banking-platform.image" -}}
{{- $registryName := .Values.global.imageRegistry -}}
{{- $repositoryName := .repository -}}
{{- $tag := .Values.image.tag | toString -}}
{{- if $registryName }}
{{- printf "%s/%s:%s" $registryName $repositoryName $tag -}}
{{- else }}
{{- printf "%s:%s" $repositoryName $tag -}}
{{- end }}
{{- end }}

{{/*
Common environment variables
*/}}
{{- define "banking-platform.commonEnvVars" -}}
- name: ASPNETCORE_ENVIRONMENT
  value: "Production"
- name: ASPNETCORE_URLS
  value: "http://+:80"
- name: Jwt__Key
  valueFrom:
    secretKeyRef:
      name: {{ include "banking-platform.fullname" . }}-jwt
      key: secret-key
- name: Jwt__Issuer
  value: {{ .Values.config.jwt.issuer | quote }}
- name: Jwt__Audience
  value: {{ .Values.config.jwt.audience | quote }}
- name: ConnectionStrings__Redis
  value: {{ include "banking-platform.redisConnectionString" . | quote }}
- name: ConnectionStrings__ServiceBus
  valueFrom:
    secretKeyRef:
      name: {{ include "banking-platform.fullname" . }}-servicebus
      key: connection-string
- name: Serilog__MinimumLevel__Default
  value: {{ .Values.logging.level | quote }}
{{- end }}

{{/*
Database environment variables
*/}}
{{- define "banking-platform.databaseEnvVars" -}}
- name: ConnectionStrings__DefaultConnection
  valueFrom:
    secretKeyRef:
      name: {{ include "banking-platform.fullname" . }}-database
      key: connection-string
{{- end }}

{{/*
Standard resource requirements
*/}}
{{- define "banking-platform.resources" -}}
{{- if .resources }}
resources:
  {{- toYaml .resources | nindent 2 }}
{{- end }}
{{- end }}

{{/*
Standard security context
*/}}
{{- define "banking-platform.securityContext" -}}
securityContext:
  {{- toYaml .Values.securityContext | nindent 2 }}
{{- end }}

{{/*
Standard pod security context
*/}}
{{- define "banking-platform.podSecurityContext" -}}
securityContext:
  {{- toYaml .Values.podSecurityContext | nindent 2 }}
{{- end }}

{{/*
Standard health check probes
*/}}
{{- define "banking-platform.healthChecks" -}}
{{- if .Values.healthChecks.enabled }}
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: {{ .Values.healthChecks.livenessProbe.initialDelaySeconds }}
  periodSeconds: {{ .Values.healthChecks.livenessProbe.periodSeconds }}
  timeoutSeconds: {{ .Values.healthChecks.livenessProbe.timeoutSeconds }}
  failureThreshold: {{ .Values.healthChecks.livenessProbe.failureThreshold }}
  successThreshold: {{ .Values.healthChecks.livenessProbe.successThreshold }}
readinessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: {{ .Values.healthChecks.readinessProbe.initialDelaySeconds }}
  periodSeconds: {{ .Values.healthChecks.readinessProbe.periodSeconds }}
  timeoutSeconds: {{ .Values.healthChecks.readinessProbe.timeoutSeconds }}
  failureThreshold: {{ .Values.healthChecks.readinessProbe.failureThreshold }}
  successThreshold: {{ .Values.healthChecks.readinessProbe.successThreshold }}
{{- end }}
{{- end }}
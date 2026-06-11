#!/bin/bash

################################################################################
# ATHLIXIR PRODUCTION TEST EXECUTION SCRIPT
# Runs all phases of testing in sequence
# Usage: ./scripts/test-execution.sh [phase]
# Phases: all, unit, integration, e2e, load, security, performance, uat
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Timestamps
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
LOG_DIR="logs/test-execution"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/test-$(date +%s).log"

# Functions
log() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
  echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

section_header() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
  echo -e "${BLUE}📋 $1${NC}" | tee -a "$LOG_FILE"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n" | tee -a "$LOG_FILE"
}

# Phase 1: Unit Tests
run_unit_tests() {
  section_header "PHASE 1: UNIT TESTS"

  log "Running frontend unit tests..."
  cd client
  npm run test:coverage 2>&1 | tee -a "$LOG_FILE"
  cd ..

  log "Running backend unit tests..."
  cd server
  npm run test 2>&1 | tee -a "$LOG_FILE"
  cd ..

  success "Unit tests completed"
}

# Phase 2: Integration Tests
run_integration_tests() {
  section_header "PHASE 2: INTEGRATION TESTS"

  log "Starting Docker services..."
  docker-compose -f docker-compose.test.yml up -d

  log "Waiting for services to be ready..."
  sleep 10

  log "Running API integration tests..."
  npm run test:api 2>&1 | tee -a "$LOG_FILE"

  log "Running database integration tests..."
  npm run test:db 2>&1 | tee -a "$LOG_FILE"

  log "Stopping Docker services..."
  docker-compose -f docker-compose.test.yml down

  success "Integration tests completed"
}

# Phase 3: E2E Tests
run_e2e_tests() {
  section_header "PHASE 3: END-TO-END TESTS"

  log "Starting application in test mode..."
  docker-compose -f docker-compose.staging.yml up -d

  log "Waiting for application to start..."
  sleep 15

  log "Running E2E tests..."
  npm run test:e2e 2>&1 | tee -a "$LOG_FILE"

  log "Stopping application..."
  docker-compose -f docker-compose.staging.yml down

  success "E2E tests completed"
}

# Phase 4: Load Tests
run_load_tests() {
  section_header "PHASE 4: LOAD TESTS"

  # Check if k6 is installed
  if ! command -v k6 &> /dev/null; then
    warning "k6 not installed. Install with: npm install -g k6"
    return
  fi

  log "Creating load test script..."
  cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.1'],
  },
};

export default function() {
  let res = http.get('http://localhost:3001/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
EOF

  log "Starting application..."
  docker-compose -f docker-compose.staging.yml up -d
  sleep 10

  log "Running load test (100 concurrent users)..."
  k6 run load-test.js 2>&1 | tee -a "$LOG_FILE"

  log "Stopping application..."
  docker-compose -f docker-compose.staging.yml down

  success "Load tests completed"
}

# Phase 5: Security Tests
run_security_tests() {
  section_header "PHASE 5: SECURITY TESTS"

  log "Checking dependencies for vulnerabilities..."
  npm audit --audit-level=moderate 2>&1 | tee -a "$LOG_FILE"

  log "Running OWASP ZAP scan (if installed)..."
  if command -v zap.sh &> /dev/null; then
    docker run -t owasp/zap2docker-stable \
      zap-baseline.py -t http://localhost:3001 2>&1 | tee -a "$LOG_FILE"
  else
    warning "OWASP ZAP not found. Install Docker to run automated security scans."
  fi

  log "Running code quality checks..."
  npm run lint 2>&1 | tee -a "$LOG_FILE"

  success "Security tests completed"
}

# Phase 6: Performance Tests
run_performance_tests() {
  section_header "PHASE 6: PERFORMANCE TESTS"

  # Check if Lighthouse is installed
  if ! command -v lighthouse &> /dev/null; then
    warning "Lighthouse not installed. Install with: npm install -g lighthouse"
    return
  fi

  log "Starting application..."
  docker-compose -f docker-compose.staging.yml up -d
  sleep 10

  log "Running Lighthouse audit..."
  lighthouse http://localhost:3001 \
    --chrome-flags="--headless --no-sandbox" \
    --output-path="$LOG_DIR/lighthouse-report.html" 2>&1 | tee -a "$LOG_FILE"

  log "Analyzing bundle sizes..."
  npm run build 2>&1 | tee -a "$LOG_FILE"

  log "Stopping application..."
  docker-compose -f docker-compose.staging.yml down

  success "Performance tests completed"
}

# Phase 7: User Acceptance Testing
run_uat() {
  section_header "PHASE 7: USER ACCEPTANCE TESTING (UAT)"

  log "UAT requires manual testing by human testers"
  log "Preparing test environment..."

  docker-compose -f docker-compose.staging.yml up -d

  log "Application started at: http://localhost:3000"
  log "API running at: http://localhost:3001"

  log "UAT checklist:"
  echo "  [ ] New user onboarding flow"
  echo "  [ ] Video upload and analysis"
  echo "  [ ] Copilot chat functionality"
  echo "  [ ] Injury risk assessment"
  echo "  [ ] Profile settings update"
  echo "  [ ] Password reset flow"
  echo "  [ ] Logout and re-login"

  read -p "Press Enter when UAT is complete..."

  docker-compose -f docker-compose.staging.yml down

  success "UAT completed"
}

# Summary report
print_summary() {
  section_header "TEST EXECUTION SUMMARY"

  log "Test log saved to: $LOG_FILE"

  success "All phases completed!"

  echo ""
  echo "Results:"
  echo "  📊 Unit Tests: Check npm test output"
  echo "  🔗 Integration Tests: Check npm run test:api output"
  echo "  🌐 E2E Tests: Check npm run test:e2e output"
  echo "  ⚡ Load Tests: Check load-test results above"
  echo "  🔒 Security Tests: Check npm audit output"
  echo "  📈 Performance Tests: Check Lighthouse report"

  echo ""
  echo "Next steps:"
  echo "  1. Review all test results"
  echo "  2. Fix any failing tests"
  echo "  3. Address security vulnerabilities"
  echo "  4. Optimize performance issues"
  echo "  5. Deploy to production when ready"
}

# Main script
main() {
  local phase=${1:-all}

  log "Starting ATHLIXIR production test execution"
  log "Phase: $phase"

  case "$phase" in
    all)
      run_unit_tests
      run_integration_tests
      run_e2e_tests
      run_load_tests
      run_security_tests
      run_performance_tests
      print_summary
      ;;
    unit)
      run_unit_tests
      ;;
    integration)
      run_integration_tests
      ;;
    e2e)
      run_e2e_tests
      ;;
    load)
      run_load_tests
      ;;
    security)
      run_security_tests
      ;;
    performance)
      run_performance_tests
      ;;
    uat)
      run_uat
      ;;
    *)
      error "Unknown phase: $phase"
      echo "Available phases: all, unit, integration, e2e, load, security, performance, uat"
      exit 1
      ;;
  esac
}

main "$@"

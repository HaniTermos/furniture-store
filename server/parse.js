const fs = require('fs');
const data = JSON.parse(fs.readFileSync('new-test-results.json', 'utf8'));
data.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed') {
      console.log('Failed Test:', test.fullName);
      console.log(test.failureMessages.join('\n'));
    }
  });
});

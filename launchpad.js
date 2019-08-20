var launch = require('launchpad');
// Launch a local browser
launch.local(function(err, local) {
  local.browsers(function(error, browsers) {
    // -> List of all browsers found locally with version
  });
  
  local.chrome('http://blog.pulipuli.info', function(err, instance) {
    // An instance is an event emitter
    instance.on('stop', function() {
      console.log('Terminated local firefox');
    });
  });
});
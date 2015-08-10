module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      dist: {
        files:
          { 'cabbage.js': ['js/pixel.js', 'js/cabbage.js'] }
      }
    },

    uglify : {
      dist: {
        files:
          { 'cabbage.min.js': ['cabbage.js'] }
      }
    },

    jshint: {
      files: {
        src: ['js/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask(
    'build',
    'Build the project',
    [ 'jshint', 'concat', 'uglify' ]
  );
};

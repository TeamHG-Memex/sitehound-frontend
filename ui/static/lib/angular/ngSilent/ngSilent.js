    'use strict';

/**
 * @ngdoc module
 * @name ngSilent
 * @description
 *
 * # ngSilent
 *
 * The `ngSilent` module provides silent routing without controller calling.
 *
 * ## Example
 * $ngSilentLocation.silent('/new/path/');
 *
 *
 * 
 */	
    angular.module('ngSilent', [])
    .factory('$ngSilentLocation', ['$location', function($location){
        return {
            '$$silentChangePath' : false,
            'silent' : function(path, needReplace){
                this.prev = $location.path();
                var location = $location.url(path);
                if (needReplace) {
                    location.replace();
                }
                this.$$silentChangePath = $location.path();
            },
            'box' : function(i, o){
                if(o[i].__silentModeMarker)
                    return;

                (function(){
                    var oldF = o[i];
                    o[i] = function(){
                        o[i] = oldF;
                    }
                })();
            }
        }
    }])
    .run(['$rootScope', '$location', '$ngSilentLocation', function($rootScope, $location, $ngSilentLocation){

        var listener = function(event){

            var silentPath = $ngSilentLocation.$$silentChangePath;
            $ngSilentLocation.$$silentChangePath = false;
            if (silentPath !== $location.path()){
                return;
            }

            for(var i in $rootScope.$$listeners['$locationChangeSuccess'])
                $ngSilentLocation.box(i, $rootScope.$$listeners['$locationChangeSuccess']);
        };

        listener.__silentModeMarker = true;

        $rootScope.$on('$locationChangeSuccess', listener);
    }]);
    

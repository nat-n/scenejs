/**
 * Root node of a scene graph. Like all nodes, its arguments are a config object followed by
 * zero or more child nodes. The members of the config object are set on the root data scope when rendered.
 *
 */

(function() {

    var backend = SceneJs.backends.getBackend('scene');

    /** Creates a new scene
     */
    SceneJs.scene = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var sceneId = null;
     
        var _scene = {

            /**
             * Renders the scene scene, passing in the given parameters to override node parameters
             * set on the root data scope, then returns an object that indicates the new scene status.
             */
            render : function(paramOverrides) {
                if (sceneId) {
                    backend.setActiveScene(sceneId);
                    var scope = SceneJs.utils.newScope(null, false); // TODO: how to determine fixed scope for cacheing??
                    var params = cfg.getParams();
                    for (var key in params) {    // Push scene params into scope
                        scope.put(key, params[key]);
                    }
                    if (paramOverrides) {        // Override with traversal params
                        for (var key in paramOverrides) {
                            scope.put(key, paramOverrides[key]);
                        }
                    }
                    SceneJs.utils.visitChildren(cfg, scope);
                    backend.setActiveScene(null);
                }
            },

            /** Returns count of active processes. A non-zero count indicates that the scene should be rendered
             * at least one more time to show the "final" image because asynchronous tasks are still being
             * performed within the scene
             */
            getNumProcesses : function() {
                return (sceneId) ? backend.getNumProcesses(sceneId) : 0;
            },

            /** Destroys this scene, after which it cannot be rendered any more. You should destroy
             * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
             * resources for it (eg. shaders, VBOs etc) that are no longer in use.
             */
            destroy : function() {
                if (sceneId) {
                    sceneId = backend.deregisterScene(sceneId);
                }
            },

            /** Returns true if scene active, ie. not destroyed
             */
            isActive: function() {
                return (sceneId != null);
            }
        };
        sceneId = backend.registerScene(_scene);
        return _scene;
    };

    /** Destroys all scenes and causes SceneJS to release all resources it is currently holding for them.
     */
    SceneJs.reset = function() {
        var scenes = backend.getAllScenes();
        var temp = [];
        for (var i = 0; i < scenes.length; i++) {
            temp.push(scenes[i]);
        }
        while (temp.length > 0) {
            temp.pop().destroy();
        }
    };
})();
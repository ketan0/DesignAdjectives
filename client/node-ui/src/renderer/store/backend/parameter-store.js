// the parameter driver provides a unified interface for interacting with an arbitrary
// parameter-based back end in a way that's vuex friendly
// This function will take a backend-compatible object and return a vue compatible store
// - ideally the store will be able to be hot swapped, but the application mode may need to adjust
//   accordingly
import path from 'path';

export function createStore(backend, type) {
  return {
    state: {
      type,
      parameters: [],
      cacheKey: '',
      backend
    },
    getters: {
      param: state => id => {
        if (id < state.parameters.length) return state.parameters[id];
        return 0;
      },
      paramsAsArray: state => {
        return state.parameters.map(p => p.value);
      },
      renderer: state => {
        return state.backend.renderer;
      }
    },
    mutations: {
      LOAD_NEW_FILE(state, config) {
        state.backend.loadNew(config);
        state.cacheKey = path.join(config.dir, config.filename);

        // at this point we need to re-load all of the parameter data
        state.parameters = backend.getParams();
      },
      SET_PARAM(state, config) {
        state.backend.setParam(
          config.id,
          config.val,
          state.parameters[config.id]
        );

        // this seems painfully inefficient, but it might be performant enough to
        // not be a problem?
        // otherwise there needs to be a Vue.set to replace the parameter object?
        state.parameters = backend.getParams();
      },
      CHANGE_BACKEND(state, config) {
        // bit of a dangerous function but whatever
        state.backend = config.backend;
        state.type = config.type;
        state.parameters = backend.getParams();
      }
    },
    actions: {
      SET_PARAM(context, config) {
        context.commit('SET_PARAM', config);
      }
    }
  };
}

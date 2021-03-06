
const INITIAL_STATE = []
const flowReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'UPLOAD_IMAGE':
      return {
        ...state,
        uploadedMedia: action.media
      };
      break;
    case 'GET_MEDIA':
      return {
        ...state,
        promise: action.promise
      }
      break;
    case 'MEDIA_RECEIVED':
      return {
        ...state,
        media: action.payload
      }
      break;
    default: return state

  }
}

export default flowReducer;

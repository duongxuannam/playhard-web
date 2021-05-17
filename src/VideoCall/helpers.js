export const openCamera = async () => {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    try{
      const stream =  await navigator.mediaDevices.getUserMedia({
            audio: true, video: true
        })
        window.stream= stream;
        return stream
    }catch(e){
        console.log('CO loi xay ra',e)
    }
}
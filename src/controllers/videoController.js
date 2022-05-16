import Video from '../models/Video';

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({createdAt: "desc"});
  //db에서 모든 Video를 찾아내고 videos라는 배열에 넣음

  return res.render('home', { pageTitle: 'Home', videos });
  // home.pug라는 템플릿에 pageTitle와 videos(db 비디오 배열)을 넘겨줌
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if(!video){
    return res.render("404",{pageTitle: "Video Not Found"});
  }
  else{
    return res.render("watch", {pageTitle: video.title, video});
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if(!video){
    return res.render("404",{pageTitle: "Video Not Found"});
  }
  return res.render('edit', { pageTitle: `Edit ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({_id: id});
  if(!video){
    return res.render("404",{pageTitle: "Video Not Found"});
  }
  await Video.findByIdAndUpdate(id,{
    title,
    description,
    hashtags: Video.formatHashtags(hashtags)
  });
  await video.save();

  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: 'Upload' });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title,
      description,
      hashtags: Video.formatHashtags(hashtags)
    });
    return res.redirect('/');
  } catch (error) {
    return res.render('upload', {
      pageTitle: 'Upload Video',
      errorMessage: error._message,
    });
  }
};

export const deleteVideoInHome = async (req, res) =>{
  const { deleteId } = req.body;
  await Video.deleteOne({_id:deleteId});

  const videos = await Video.find({});
  //db에서 모든 Video를 찾아내고 videos라는 배열에 넣음

  return res.render('home', { pageTitle: 'Home', videos });
  // home.pug라는 템플릿에 pageTitle와 videos(db 비디오 배열)을 넘겨줌
}

export const deleteVideo = async (req, res) =>{
  const { id } = req.params;
  await Video.findByIdAndDelete(id);

  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  
  if(keyword){
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      }
    });
  }
  return res.render("search", {pageTitle: "Search", videos});
}
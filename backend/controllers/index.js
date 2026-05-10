




const useMongoDB = !!process.env.MONGODB_URI;


module.exports = {
  authController: useMongoDB 
    ? require('./authController') 
    : require('./authController_sqlite'),
  
  propertyController: useMongoDB 
    ? require('./propertyController') 
    : require('./propertyController_sqlite'),
  
  bookmarkController: useMongoDB 
    ? require('./bookmarkController') 
    : require('./bookmarkController_sqlite'),
  
  messageController: useMongoDB 
    ? require('./messageController') 
    : require('./messageController_sqlite')
};

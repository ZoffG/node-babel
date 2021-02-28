const errorHandler = (err, req, res, next) => {
  // let error;
  // if (err.message) {
  //     error = err.message
  //   } else {
  //       error = "something broke!";
  // }

  // variable = Boolean(statement) ? true : false ;
  const error = err.message ? err.message : 'Something broke!';

  return res.status(500).json({ error });
};

export default errorHandler;

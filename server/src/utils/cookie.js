export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'Strict', 
  path: '/',                 // cookie is sent for every request
};

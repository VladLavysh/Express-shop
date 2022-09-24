const keys = require('../keys')

module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Password recover',
    html: `
      <h1>Do you want to restore access?</h1>
      <p>If not - ignore this email</p>
      <p>
        Otherwise, follow the
          <a href='${keys.BASE_URL}/auth/password/${token}'>link</a>
        to recover your password
      </p>
      <hr/>
      <a href='${keys.BASE_URL}'>Courses Shop</a>
    `
  }
}
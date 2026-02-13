// tests/mocks/axios.cjs
const mockAxios = {
  post: jest.fn((url) => {
    // Google OAuth token
    if (url.includes('oauth2.googleapis.com/token')) {
      return Promise.resolve({
        data: {
          access_token: 'mock-google-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      });
    }
    
    // GitHub OAuth token
    if (url.includes('github.com/login/oauth/access_token')) {
      return Promise.resolve({
        data: {
          access_token: 'mock-github-access-token',
          token_type: 'bearer',
          scope: 'read:user,user:email',
        },
      });
    }
    
    return Promise.resolve({ data: {} });
  }),
  
  get: jest.fn((url) => {
    // Google user info
    if (url.includes('googleapis.com/oauth2/v2/userinfo')) {
      return Promise.resolve({
        data: {
          id: 'mock-google-id',
          email: 'test@gmail.com',
          name: 'Test User',
          picture: 'https://example.com/avatar.jpg',
        },
      });
    }
    
    // GitHub user info
    if (url.includes('api.github.com/user') && !url.includes('emails')) {
      return Promise.resolve({
        data: {
          id: 123456,
          login: 'testuser',
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
          email: null,
        },
      });
    }
    
    // GitHub emails
    if (url.includes('api.github.com/user/emails')) {
      return Promise.resolve({
        data: [
          { email: 'test@github.com', primary: true, verified: true },
        ],
      });
    }
    
    return Promise.resolve({ data: {} });
  }),
};

module.exports = mockAxios;
module.exports.default = mockAxios;

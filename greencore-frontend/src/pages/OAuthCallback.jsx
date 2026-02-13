import { useEffect, useRef } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/ui/Loading';



const OAuthCallback = () => {
  const { handleOAuthCallback } = useAuth();
  const [searchParams] = useSearchParams();
  const { provider: routeProvider } = useParams();
  const location = useLocation();
  const called = useRef(false);

  useEffect(() => {
    // Prevent double-call in StrictMode
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');


    let provider = routeProvider;
    if (!provider) {
      provider = searchParams.get('provider');
    }
    if (!provider) {

      const match = location.pathname.match(/\/auth\/(\w+)\/callback/);
      if (match) provider = match[1];
    }

    if (error) {
      console.error('OAuth error from provider:', error);
      handleOAuthCallback(provider, null); // will show error
      return;
    }

    if (code && provider) {
      handleOAuthCallback(provider, code);
    } else {
      console.error('Missing code or provider in OAuth callback', {
        code: !!code,
        provider,
        pathname: location.pathname,
        search: location.search,
      });
      handleOAuthCallback(null, null);
    }
  }, []);

  return <LoadingScreen />;
};

export default OAuthCallback;

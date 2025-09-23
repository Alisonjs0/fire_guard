import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';


interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      // Verifica expiração (exp em segundos)
      if (!decoded.exp || Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem('authToken');
        router.replace('/login');
        return;
      }
    } catch (err) {
      localStorage.removeItem('authToken');
      router.replace('/login');
      return;
    }
  }, [router]);

  return <>{children}</>;
}

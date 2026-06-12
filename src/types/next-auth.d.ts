import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      roles: string[];
      department?: string | null;
      title?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    roles: string[];
    department?: string | null;
    title?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: string[];
    department?: string | null;
    title?: string | null;
  }
}

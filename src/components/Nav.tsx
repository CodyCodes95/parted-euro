import Link from "next/link"
import { useSession } from "next-auth/react";

const Nav: React.FC = () => {
  const { data: session } = useSession();
    return (
      <div className="flex h-20 w-full items-center justify-around bg-white">
        <div>
          img
          <Link href="#">Home</Link>
          <Link href="#">Shop By Generation</Link>
          <Link href="#">Shop By Wheels</Link>
          <Link href="#">Cars Wrecking Now</Link>
          <Link href="#">Warrenty & Return Policy</Link>
          <Link href="#">Contact</Link>
        </div>
        <div>
          <Link href="#">Search</Link>
          <Link href="#">Cart</Link>
          {session ? (
            <Link href="/api/auth/signout">Logout</Link>
          ) : (
            <Link href="/api/auth/signin">Login</Link>
          )}
          {session ? (
            <Link href="/admin">Admin</Link>
          ) : null}
        </div>
      </div>
    );
}

export default Nav
import Link from "next/link"

const Nav: React.FC = () => {
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
          <Link href="#">Login</Link>
        </div>
      </div>
    );
}

export default Nav
const NavBackdrop: React.FC<any> = ({setShowSearch, showSearch}) => {
  return (
    <div onClick={() => setShowSearch(!showSearch)} className="fixed top-20 left-0 z-[51] h-screen w-full bg-[#00000063]"></div>
  );
};

export default NavBackdrop;

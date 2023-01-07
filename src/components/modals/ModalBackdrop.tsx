interface ModalBackdropProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const ModalBackDrop: React.FC<ModalBackdropProps> = ({setShowModal}) => {
  return (
    <div onClick={() => setShowModal(false)} className="fixed top-0 left-0 h-screen w-full bg-[#000000e1]"></div>
  );
};

export default ModalBackDrop;

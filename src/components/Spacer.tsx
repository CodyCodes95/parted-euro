type SpacerProps = {
    amount: string
}

const Spacer:React.FC<SpacerProps> = ({amount}) => {
  return (
    <div className={`p-${amount}`}></div>
  )
}

export default Spacer
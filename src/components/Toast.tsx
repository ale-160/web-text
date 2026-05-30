

interface ToastProps {
  message: string
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  return <div className="toast">{message}</div>
}

export default Toast

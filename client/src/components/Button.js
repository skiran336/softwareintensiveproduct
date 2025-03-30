// components/Button.js
import styles from '../styles/components/Button.module.css';

export default function Button({ children, variant = 'primary', fullWidth }) {
  const classNames = [
    styles.button,
    styles[variant],
    fullWidth && styles.fullWidth
  ].filter(Boolean).join(' ');

  return <button className={classNames}>{children}</button>;
}
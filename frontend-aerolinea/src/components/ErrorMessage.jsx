import styles from './ErrorMessage.module.css';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.errorText}>{message}</p>
            {onRetry && (
                <button onClick={onRetry} className={styles.retryButton}>
                    Reintentar
                </button>
            )}
        </div>
    );
};

ErrorMessage.propTypes = {
    message: PropTypes.string.isRequired,
    onRetry: PropTypes.func
};

export default ErrorMessage;
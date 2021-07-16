import styles from './index.scss';
import { history } from 'umi';

export default function IndexPage() {
  return (
    <div>
      <h1 className={styles.title}>Page index11</h1>
      <button onClick={() => history.push('/module1')}>
        navigateTo module1
      </button>
      <button
        onClick={() =>
          history.push({
            pathname: '/module2',
            state: {
              a: 123,
              b: { c: 123 },
            },
            query: {
              id: '123',
              page: '10',
            },
          })
        }
      >
        navigateTo module2
      </button>
    </div>
  );
}

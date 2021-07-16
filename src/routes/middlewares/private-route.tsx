import { Redirect } from 'umi';

export default (props: any) => {
  console.log('检测是否有登录态', props);

  if (true) {
    return <div>{props.children}</div>;
  } else {
    return <Redirect to="/login" />;
  }
};

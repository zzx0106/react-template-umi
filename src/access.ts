console.log('进入access');
export default function access(initialState: { currentUser?: string }) {
  const { currentUser } = initialState || {};
  console.log('currentUser', currentUser);

  return {
    canAdmin: currentUser && currentUser === 'adm2',
    // canAdmin: currentUser && currentUser.access === 'admin',
    // canAdmin: currentUser && currentUser.access === 'admin',
  };
}

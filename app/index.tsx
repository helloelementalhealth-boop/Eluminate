
import { Redirect } from 'expo-router';

export default function Index() {
  console.log('[Index] Redirecting to opening screen');
  return <Redirect href="/opening" />;
}

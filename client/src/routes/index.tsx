import { RouteProps, Routes as Switch, Route } from 'react-router-dom';

import Home from '@pages/Home';
import Page404 from '@pages/Page404';
import Lobby from '@pages/Lobby';
import JoinRoom from '@components/game/JoinRoom';
import Offline from '@components/game/Offline';
import Online from '@components/game/Online';

export enum RouteType {
  PUBLIC,
  PRIVATE,
  RESTRICTED,
}
interface AppRoute extends RouteProps {
  type?: RouteType;
}
export const AppRoutes: AppRoute[] = [
  // Public Routes
  {
    type: RouteType.PUBLIC,
    path: 'join',
    children: <JoinRoom />,
  },
  {
    type: RouteType.PUBLIC,
    path: 'online',
    children: <Online />,
  },
  {
    type: RouteType.PUBLIC,
    path: 'lobby',
    children: <Lobby />,
  },
  {
    type: RouteType.PUBLIC,
    path: 'offline',
    children: <Offline />,
  },
  {
    type: RouteType.PUBLIC,
    path: '/',
    children: <Home />,
  },
];

const Routes = () => {
  return (
    <Switch>
      {AppRoutes.map((r) => {
        return <Route key={`${r.path}`} path={`/${r.path}`} element={r.children} />;
      })}
      <Route path="*" element={<Page404 />} />
    </Switch>
  );
};

export default Routes;

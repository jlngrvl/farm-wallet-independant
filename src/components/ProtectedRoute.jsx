import { useAtom } from 'jotai';
import { selectedFarmAtom, walletConnectedAtom } from '../atoms';
import PropTypes from 'prop-types';
import DisconnectedView from './Layout/DisconnectedView';

/**
 * Protected route component that ensures wallet is connected AND a farm is selected
 * Redirects to directory if no farm is selected or wallet disconnected
 */
const ProtectedRoute = ({ children, requireFarm = true }) => {
  const [selectedFarm] = useAtom(selectedFarmAtom);
  const [walletConnected] = useAtom(walletConnectedAtom);

  // Show disconnected view if wallet not connected
  if (!walletConnected) {
    return <DisconnectedView />;
  }

  // If farm required but not selected, show disconnected view
  if (requireFarm && !selectedFarm) {
    return <DisconnectedView />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireFarm: PropTypes.bool,
};

export default ProtectedRoute;

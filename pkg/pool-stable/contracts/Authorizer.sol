// SPDX-License-Identifier: GPL-3.0-or-later
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.7.0;

import "@balancer-labs/v2-interfaces/contracts/vault/IAuthorizer.sol";

/**
 * @dev Temporary Authorizer upgrade that fixes the issue in the AuthorizerAdaptor and allows usage of
 * the AuthorizerAdaptorEntrypoint. The previous Authorizer is the one that actually keeps track of permissions.
 *
 * This is expected to be replaced by the TimelockAuthorizer, which also includes this fix.
 */
contract Authorizer is IAuthorizer {
    bytes32 public actioinId;
    address public account;
    address public where;

    constructor(
        bytes32 _actionId,
        address _account,
        address _where
    ) {
        actioinId = _actionId;
        account = _account;
        where = _where;
    }

    function canPerform(
        bytes32 _actionId,
        address _account,
        address _where
    ) external view override returns (bool) {
        if (_actionId != actioinId) {
            return false;
        }
        if (_account != account) {
            return false;
        }
        if (_where != where) {
            return false;
        }

        return true;
    }
}

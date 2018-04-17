pragma solidity ^0.4.21;

contract BountyHunt {
  // The hashed version of the secret to unlock the bounty
  bytes32 public hashedSecret;

  // The constructor function, called when we deploy the contract
  function BountyHunt(bytes32 _hashedSecret) public {
    hashedSecret = _hashedSecret;
  }

  // The fallback payable function that accepts incoming payments,
  // so that Cryptizen can easily top-up the bounty after deployment.
  // Note that top-up happens only once.
  function () payable public {}

  // The claim function, called by the person that will find the right
  // secret. A candidate secret will unlock the bounty only if its
  // hash is equal to the hashed secret of the contract.
  function claimBounty(string _secret) public {
    require(keccak256(_secret) == hashedSecret);
    msg.sender.transfer(address(this).balance);
  }
}

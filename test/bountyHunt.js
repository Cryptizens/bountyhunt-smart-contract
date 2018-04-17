// We use the following online keccak256 calculator: https://emn178.github.io/online-tools/keccak_256.html
// Hashing flow:
// 1. Take any long enough text and paste it in the calculator
// 2. Copy the resulting hash and hash it too
// 3. The resulting 'double hash' is the one that must be used in the contract
//    constructor function (with the leading 0x flag for bytes32, which should not be hashed!)
// 4. The 'simple hash' is the one that must be submitted as a candidate
//    to unlock the bounty

const BountyHunt = artifacts.require('./BountyHunt.sol')

contract('BountyHunt', function ([owner, hunter]) {
  let correctSecret
  let incorrectSecret
  let hashedSecret

  let reward

  let bountyHunt
  let bountyHuntAddress

  beforeEach('setup contract for each test', async function () {
      correctSecret = '99b3073692692fbbec7e5e98fc52bcc275c48107fd432f6908efffaf3c401cd6'
      incorrectSecret = 'b07abba516bdad9b19ce62f0cf146034afb141a53d222742f2bb258f69727bc1'
      hashedSecret = '0xf721c3b8e04e484febdd0d43d5289d03980eb8eac2d7446f592b131fea6336b1'

      reward = 1e+18

      bountyHunt = await BountyHunt.new(hashedSecret)
      bountyHuntAddress = await bountyHunt.address
  })

  it('correctly sets the hashed secret at deployment', async function () {
      assert.equal(await bountyHunt.hashedSecret(), hashedSecret)
  })

  it('correctly accepts top-up after deployment', async function () {
      await bountyHunt.sendTransaction({ value: reward, from: owner })
      assert.equal(web3.eth.getBalance(bountyHuntAddress).toNumber(), reward)
  })

  it('does not unlock the reward if an incorrect secret is used', async function () {
      await bountyHunt.sendTransaction({ value: reward, from: owner })
      assert.equal(web3.eth.getBalance(bountyHuntAddress).toNumber(), reward)

      try {
          await bountyHunt.claimBounty(incorrectSecret, { from: hunter })
          assert.fail()
      } catch (error) {
          assert(error.toString().includes('revert'), error.toString())
      }

      assert.equal(web3.eth.getBalance(bountyHuntAddress).toNumber(), reward)
  })

  it('does unlock the reward if the correct secret is used', async function () {
      await bountyHunt.sendTransaction({ value: reward, from: owner })
      assert.equal(web3.eth.getBalance(bountyHuntAddress).toNumber(), reward)

      const hunterBalanceBeforeClaim = web3.eth.getBalance(hunter).toNumber()

      await bountyHunt.claimBounty(correctSecret, { from: hunter })

      const hunterBalanceAfterClaim = web3.eth.getBalance(hunter).toNumber()

      assert.equal(web3.eth.getBalance(bountyHuntAddress).toNumber(), 0)
      assert.isAbove(hunterBalanceAfterClaim, hunterBalanceBeforeClaim)
  })
})

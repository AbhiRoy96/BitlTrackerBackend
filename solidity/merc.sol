pragma solidity ^0.4.15;

contract Merc {
    string contract_id;
    uint amount;
    address owner;
    address sign_from;
    uint constant priceConst = 1 wei;

    mapping (address => uint) public purchasedContracts;
    
    event Transfering(address from, address to, uint price, string awb);
    // event Approve(address from, address to, uint price, string awb);
    
    function Merc() {
        owner = msg.sender;
    }
    
    // function getOwner() public returns(address) {
    //     return owner;
    // }

    function setContactAWB(string _merc, uint _value, address from) payable {
        contract_id = _merc;
        amount = _value * priceConst;
        sign_from = from;
        // owner = 0x39365A7CFc35BF878bAc756c4B12eD3C8d7DbdE1;
        purchasedContracts[from] += amount;
        Transfering(sign_from, owner, amount, contract_id);
    } 
}
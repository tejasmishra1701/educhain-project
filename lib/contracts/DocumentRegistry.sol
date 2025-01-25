// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentRegistry {
    address public owner;
    mapping(string => Document) private documents; // eduID -> Document struct
    
    struct Document {
        string ipfsUrl;
        uint256 timestamp;
        bool verified;
        string institution;
    }
    
    event DocumentUpdated(string indexed eduId, string ipfsUrl, string institution);
    event DocumentVerified(string indexed eduId, string institution);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function updateDocument(
        string memory eduId,
        string memory ipfsUrl,
        string memory institution
    ) public {
        require(bytes(eduId).length > 0, "eduId cannot be empty");
        require(bytes(ipfsUrl).length > 0, "ipfsUrl cannot be empty");
        require(bytes(institution).length > 0, "institution cannot be empty");
        
        documents[eduId] = Document({
            ipfsUrl: ipfsUrl,
            timestamp: block.timestamp,
            verified: false,
            institution: institution
        });
        
        emit DocumentUpdated(eduId, ipfsUrl, institution);
    }
    
    function verifyDocument(string memory eduId) public onlyOwner {
        require(bytes(eduId).length > 0, "eduId cannot be empty");
        require(bytes(documents[eduId].ipfsUrl).length > 0, "Document does not exist");
        
        documents[eduId].verified = true;
        emit DocumentVerified(eduId, documents[eduId].institution);
    }
    
    function getDocument(string memory eduId) public view returns (
        string memory ipfsUrl,
        uint256 timestamp,
        bool verified,
        string memory institution
    ) {
        require(bytes(eduId).length > 0, "eduId cannot be empty");
        Document memory doc = documents[eduId];
        return (doc.ipfsUrl, doc.timestamp, doc.verified, doc.institution);
    }
}
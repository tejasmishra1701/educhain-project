// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentRegistry {
    struct Document {
        string ipfsUrl;
        uint256 timestamp;
        string metadata;
    }
    
    mapping(address => Document) private documents;
    
    event DocumentUpdated(
        address indexed uploader,
        string ipfsUrl,
        uint256 timestamp
    );
    
    function updateDocument(string memory ipfsUrl, string memory metadata) public {
        require(bytes(ipfsUrl).length > 0, "IPFS URL cannot be empty");
        
        documents[msg.sender] = Document({
            ipfsUrl: ipfsUrl,
            timestamp: block.timestamp,
            metadata: metadata
        });
        
        emit DocumentUpdated(msg.sender, ipfsUrl, block.timestamp);
    }
    
    function getDocument(address walletAddress) public view returns (
        string memory ipfsUrl,
        uint256 timestamp,
        string memory metadata
    ) {
        Document memory doc = documents[walletAddress];
        require(bytes(doc.ipfsUrl).length > 0, "Document does not exist");
        return (
            doc.ipfsUrl,
            doc.timestamp,
            doc.metadata
        );
    }
}
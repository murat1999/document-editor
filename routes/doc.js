const express = require('express');
const jwt = require('jsonwebtoken');
const Doc = require('../models/Doc');
const Change = require('../models/Change');
const session = require('../utils/session');

const router = express.Router();

// Middleware to authenticate the user based on the provided JWT
function authenticateUser(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userData = session.getUserData(token);

  if (!userData) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Attach user information to the request for further processing
  req.user = userData;

  next();
}

// Endpoint to retrieve the latest version and content of the Doc
router.get('/get', authenticateUser, async (req, res) => {
  try {
    // Ensure there is at least one document in the database
    const docCount = await Doc.count();

    if (docCount === 0) {
      // Insert a default document if none exist
      await Doc.create({
        content: 'Hi! This is example document.',
        version: 0,
      });
    }

    // Retrieve the latest Doc from the database
    const latestDoc = await Doc.findOne({
      order: [['version', 'DESC']],
      attributes: ['content', 'version'],
      limit: 1,
    });

    if (!latestDoc) {
      return res.status(404).json({ error: 'Doc not found' });
    }

    res.json({
      content: latestDoc.content,
      version: latestDoc.version,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/edit', authenticateUser, async (req, res) => {
    try {
        const { email, name } = req.user;
        const { version, position, insertText, deleteTextCount } = req.body;

        console.log(req.body)

        const change = await Change.create({
            version,
            position,
            insertText,
            deleteTextCount,
        });

        const editedDoc = await applyChangeToDoc(change);

        res.json({
            content: editedDoc.content,
            version: editedDoc.version,
        });      
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error'})
    }
});

function insertTextAtPosition(text, position, insertText) {
    return text.slice(0, position) + insertText + text.slice(position);
}

function insertTwoTexts(original, position1, text1, position2, text2) {
    return original.slice(0, position1) + text1 + original.slice(position1, position2) + text2 + original.slice(position2);
}

function stringIntersection(str1, str2) {
    const charFrequency1 = calculateCharFrequency(str1);
    const charFrequency2 = calculateCharFrequency(str2);
  
    const commonCharacters = [];
    for (const [char, frequency] of charFrequency1.entries()) {
      const minFrequency = Math.min(frequency, charFrequency2.get(char) || 0);
      commonCharacters.push(char.repeat(minFrequency));
    }
  
    const intersectionString = commonCharacters.join('');
  
    return intersectionString;
}
  
function calculateCharFrequency(str) {
    const charFrequency = new Map();
    for (const char of str) {
        charFrequency.set(char, (charFrequency.get(char) || 0) + 1);
    }
    return charFrequency;
}

function deleteTextFromPosition(text, position, deleteTextCount) {
    if (deleteTextCount >= text.length) {
        // If deleteTextCount is greater than or equal to the content length, remove all content
        return '';
    } else {
        // Remove text starting from the specified position up to deleteTextCount characters
        return text.slice(0, position) + text.slice(position + deleteTextCount);
    }
}

function insertAndDelete(text, insertPosition, insertText, deletePosition, deleteTextCount) {
    const insertChange = insertTextAtPosition(text, insertPosition, insertText);
    const deleteChange = deleteTextFromPosition(text, deletePosition, deleteTextCount);

    const indexesInOriginalString = [];


    const intersect = stringIntersection(insertChange, deleteChange);

    for (let i = 0; i < intersect.length; i++) {
        const char = intersect[i];
        const originalIndex = text.indexOf(char); // Find the index of the character in the original string
        indexesInOriginalString.push(originalIndex);
      }
      console.log(indexesInOriginalString)
  
      for (let i = 0; i < indexesInOriginalString.length; i++) {
          const currentCharacter = intersect[i];
          
          // Check if there's a next character
          const nextIndex = i + 1;
          if (nextIndex < intersect.length) {
            const nextCharacter = intersect[nextIndex];
            if (indexesInOriginalString[i] < insertPosition && insertPosition <= indexesInOriginalString[nextIndex]) {
              return insertTextAtPosition(intersect, i + 1, insertText)
            }
            console.log(`Character at index ${i}: ${currentCharacter}, Next character: ${nextCharacter}`);
            
          } else {
            console.log(`Character at index ${i}: ${currentCharacter}, No next character`);
            return insertTextAtPosition(intersect, nextIndex, insertText)
          }
    }
}


async function applyChangeToDoc(change) {
    const latestDoc = await Doc.findOne({ order: [['version', 'DESC']] });
    const currentDoc = await Doc.findOne({
        where: { version: change.version },
    });

    let modifiedContent = currentDoc.content;

    if (!currentDoc) {
        return res.status(404).json({ error: 'Doc not found' });
    }

    if (latestDoc.version === currentDoc.version) {
        if (change.insertText) {
            // If insertText is provided, insert it at the specified position
            modifiedContent = insertTextAtPosition(modifiedContent, change.position, change.insertText);
        }
    
        if (change.deleteTextCount > 0 && modifiedContent.length > 0) {
            // If deleteTextCount is greater than 0 and the content is not empty

            modifiedContent = deleteTextFromPosition(modifiedContent, change.position, change.deleteTextCount);
        }
    } else if (latestDoc.version > currentDoc.version) {
        const changes = await Change.findAll({
            where: { version: currentDoc.version },
        });

        if (changes[0].insertText && changes[1].insertText) {
            if (changes[0].position === changes[1].position) {
                let insertedTexts = changes[0].insertText + changes[1].insertText;
                modifiedContent = insertTextAtPosition(modifiedContent, changes[0].position, insertedTexts);
            } else {
                modifiedContent = insertTwoTexts(modifiedContent, changes[0].position, changes[0].insertText, changes[1].position, changes[1].insertText);
            }
        } else if (changes[0].insertText && changes[1].deleteTextCount > 0) {
            modifiedContent = insertAndDelete(modifiedContent, changes[0].position, changes[0].insertText, changes[1].position, changes[1].deleteTextCount);
        } else if (changes[0].deleteTextCount > 0 && changes[1].insertText) {
            modifiedContent = insertAndDelete(modifiedContent, changes[1].position, changes[1].insertText, changes[0].position, changes[0].deleteTextCount);
        } else if (changes[0].deleteTextCount > 0 && changes[1].deleteTextCount > 0) {
            const firstChange = deleteTextFromPosition(modifiedContent, changes[0].position, changes[0].deleteTextCount);
            const secondChange = deleteTextFromPosition(modifiedContent, changes[1].position, changes[1].deleteTextCount);

            modifiedContent = stringIntersection(firstChange, secondChange);
        }
    }

    const newDoc = await Doc.create({
        content: modifiedContent,
        version: latestDoc.version + 1,
    });
  
    return newDoc;
}

module.exports = router;

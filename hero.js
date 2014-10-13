/*

  The only function that is required in this file is the "move" function

  You MUST export the move function, in order for your code to run
  So, at the bottom of this code, keep the line that says:

  module.exports = move;

  The "move" function must return "North", "South", "East", "West", or "Stay"
  (Anything else will be interpreted by the game as "Stay")

  The "move" function should accept two arguments that the website will be passing in:
    - a "gameData" object which holds all information about the current state
      of the battle

    - a "helpers" object, which contains useful helper functions
      - check out the helpers.js file to see what is available to you

    (the details of these objects can be found on javascriptbattle.com/#rules)

  This file contains four example heroes that you can use as is, adapt, or
  take ideas from and implement your own version. Simply uncomment your desired
  hero and see what happens in tomorrow's battle!

  Such is the power of Javascript!!!

*/

/*
// Aggressor
var move = function(gameData, helpers) {
  // Here, we ask if your hero's health is below 30
  if (gameData.activeHero().health <= 30){
    // If it is, head towards the nearest health well
    return helpers.findNearestHealthWell(gameData);
  } else {
    // Otherwise, go attack someone...anyone.
    return helpers.findNearestEnemy(gameData);
  }
};
*/
/*
// Health Nut
var move = function(gameData, helpers) {
  // Here, we ask if your hero's health is below 75
  if (gameData.activeHero().health <= 75){
    // If it is, head towards the nearest health well
    return helpers.findNearestHealthWell(gameData);
  } else {
    // Otherwise, go mine some diamonds!!!
    return helpers.findNearestDiamondMine(gameData);
  }
};
*/
// Balanced

//TL;DR: If you are new, just uncomment the 'move' function that you think sounds like fun!
//       (and comment out all the other move functions)


// // The "Northerner"
// // This hero will walk North.  Always.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   return 'North';
// };

// // The "Blind Man"
// // This hero will walk in a random direction each turn.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   var choices = ['North', 'South', 'East', 'West'];
//   return choices[Math.floor(Math.random()*4)];
// };

// // The "Priest"
// // This hero will heal nearby friendly champions.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//
//   if (myHero.health < 60) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestTeamMember(gameData);
//   }
// };

findNearestWeakerEnemy = function(gameData, helpers) {
  var hero = gameData.activeHero;
  var board = gameData.board;

  //Get the path info object
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(board, hero, function(enemyTile) {
    return enemyTile.type === 'Hero' && enemyTile.team !== hero.team && enemyTile.health < hero.health;
  });

  return pathInfoObject;
};

findNearestNonTeamDiamondMine = function(gameData, helpers) {
  var hero = gameData.activeHero;
  var board = gameData.board;

  //Get the path info object
  var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(board, hero, function(mineTile) {
    if (mineTile.type === 'DiamondMine') {
      if (mineTile.owner) {
        return mineTile.owner.team !== hero.team || mineTile.owner.dead;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }, board);

  return pathInfoObject;
};

// helpful opportunist
var move = function(gameData, helpers) {
  var board = gameData.board;
  var me = gameData.activeHero;
  var aroundMe = {
    'North' : undefined,
    'East'  : undefined,
    'South' : undefined,
    'West'  : undefined
  };
  var direction;
  var friend, enemy, mine, grave, well;
  var nearestWeakerEnemy, nearestNonTeamDiamondMine, nearestLongGoal;
  var defaultMoves = [
    'findNearestTeamMember',
    'findNearestEnemy'
  ];
  var defaultMove;
  var movePrecedence = {
    finishEnemy: 1,
    helpFriend: 2,
    getHealthy: 3,
    takeBreak: 3,
    takeMine: 4,
    takeGrave: 5
  };
  var bestMove = {
    intent: undefined,
    direction: undefined
  };
  var determineBestMove = function(intent, direction) {
    if(direction !== undefined && bestMove.intent === undefined ||
        movePrecedence[bestMove.intent] > movePrecedence[intent]) {
      bestMove = {
        intent: intent,
        direction: direction
      }
    }
  };

  if(me.health <= 60) {
    // go get healthy
    determineBestMove('getHealthy', helpers.findNearestHealthWell(gameData));
  }

  for(direction in aroundMe) {
    aroundMe[direction] = helpers.getTileNearby(
      board, me.distanceFromTop, me.distanceFromLeft, direction);

    switch(aroundMe[direction].type) {
      case 'Hero': {
        if(me.team === aroundMe[direction].team) {
          friend = aroundMe[direction];
        }
        else {
          enemy = aroundMe[direction];
        }

        if(friend && friend.health <= 60) {
          // help a weak friend
          determineBestMove('helpFriend', direction);
        }

        if(enemy && enemy.health <= 30) {
          // finish off a weak enemy
          determineBestMove('finishEnemy', direction);
        }

        break;
      }
      case 'DiamondMine': {
        mine = aroundMe[direction];

        if(mine.owner === undefined || mine.owner.team !== me.team) {
          determineBestMove('takeMine', direction);
        }

        break;
      }
      case 'HealthWell': {
        well = aroundMe[direction];

        if(me.health < 100) {
          // chill out
          determineBestMove('takeBreak', direction);
        }

        break;
      }
      case 'Unoccupied': {
        if(aroundMe[direction].subType === 'Bones') {
          grave = aroundMe[direction];
          determineBestMove('takeGrave', direction);
        }
      }
    }
  }

  // long game
  if(!bestMove.direction) {
    nearestWeakerEnemy = findNearestWeakerEnemy(gameData, helpers);
    nearestNonTeamDiamondMine = findNearestNonTeamDiamondMine(gameData, helpers);

    if(nearestWeakerEnemy && nearestWeakerEnemy.distance) {
      nearestLongGoal = nearestWeakerEnemy;
      nearestLongGoal.intent = 'findNearestWeakerEnemy';
    }

    if(nearestNonTeamDiamondMine && nearestNonTeamDiamondMine.distance &&
      !nearestWeakerEnemy ||
      nearestNonTeamDiamondMine.distance < nearestWeakerEnemy.distance) {
      nearestLongGoal = nearestNonTeamDiamondMine;
      nearestLongGoal.intent = 'findNearestNonTeamDiamondMine';
    }

    if(nearestLongGoal) {
      determineBestMove(nearestLongGoal.intent, nearestLongGoal.direction);
    }
  }

  while(!bestMove.direction && defaultMoves.length) {
    defaultMove = defaultMoves.shift();
    determineBestMove(defaultMove, helpers[defaultMove].call(this, gameData));
  }

  //console.log(me, bestMove, aroundMe, friend, enemy, mine, well, grave);

  return bestMove.direction;
};

// // The "Unwise Assassin"
// // This hero will attempt to kill the closest enemy hero. No matter what.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   if (myHero.health < 30) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestEnemy(gameData);
//   }
// };

// // The "Careful Assassin"
// // This hero will attempt to kill the closest weaker enemy hero.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   if (myHero.health < 50) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestWeakerEnemy(gameData);
//   }
// };

// The "Safe Diamond Miner"
// This hero will attempt to capture enemy diamond mines.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//
//   //Get stats on the nearest health well
//   var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
//     if (boardTile.type === 'HealthWell') {
//       return true;
//     }
//   });
//   var distanceToHealthWell = healthWellStats.distance;
//   var directionToHealthWell = healthWellStats.direction;
//
//
//   if (myHero.health < 40) {
//     //Heal no matter what if low health
//     return directionToHealthWell;
//   } else if (myHero.health < 100 && distanceToHealthWell === 1) {
//     //Heal if you aren't full health and are close to a health well already
//     return directionToHealthWell;
//   } else {
//     //If healthy, go capture a diamond mine!
//     return helpers.findNearestNonTeamDiamondMine(gameData);
//   }
// };


// // The "Selfish Diamond Miner"
// // This hero will attempt to capture diamond mines (even those owned by teammates).
// var move = function(gameData, helpers) {
  // var myHero = gameData.activeHero;

  //Get stats on the nearest health well
  // var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
    // if (boardTile.type === 'HealthWell') {
      // return true;
    // }
  // });

  // var distanceToHealthWell = healthWellStats.distance;
  // var directionToHealthWell = healthWellStats.direction;

  // if (myHero.health < 40) {
    //Heal no matter what if low health
    // return directionToHealthWell;
  // } else if (myHero.health < 100 && distanceToHealthWell === 1) {
    //Heal if you aren't full health and are close to a health well already
    // return directionToHealthWell;
  // } else {
    //If healthy, go capture a diamond mine!
    // return helpers.findNearestUnownedDiamondMine(gameData);
  // }
// };

// // The "Coward"
// // This hero will try really hard not to die.
// var move = function(gameData, helpers) {
//   return helpers.findNearestHealthWell(gameData);
// }

// Export the move function here
module.exports = move;

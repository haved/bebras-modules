function LanguageTheory(rng){

   this.rng = rng;

   this.setRNG = function(fct) {
      this.rng = fct;
   };

   this.getWordList = function(minLength,maxLength) {
      var wordList = [];
      var array = [];
      var minLength = minLength || 0;
      var maxLength = maxLength || Infinity;
      for(var nounType of nounTypes){
         if(nounType != "city"){
            array = array.concat(nouns[nounType]["M"]).concat(nouns[nounType]["F"]);
         }else{
            array = array.concat(nouns[nounType]);
         }
      }
      array = array.concat(adjectives["before"]).concat(adjectives["after"]);

      for(var word of array){
         if(word[0].length >= minLength && word[0].length <= maxLength && !word[0].includes(" ") && !word[0].includes("-")){
            wordList.push(word[0]);
         }
      }

      return wordList;
   };
   
   this.getRandomWord = function(minLength,maxLength) {
      var wordList = this.getWordList(minLength,maxLength);
      var index = (this.rng.nextInt(0,10000) + Math.floor(Math.random()*10000))%(wordList.length-1);
      var word = this.formatWord(wordList[index]);
      return word;
   };

   this.formatWord = function(word) {
      word = word.toLowerCase().trim();
      word = word.replace(/[èéêë]/g,"e");
      word = word.replace(/[ôö]/g,"o");
      word = word.replace(/[âà]/g,"a");
      word = word.replace(/[îï]/g,"i");
      word = word.replace(/[û]/g,"u");
      word = word.toUpperCase();
      return word;
   };

   this.getWords = function(minLength,maxLength,nbWords) {
      var wordList = this.getWordList(minLength,maxLength);
      // this.rng.shuffle(wordList);
      Beav.Array.shuffle(wordList,this.rng.nextInt(0,10000) + Math.floor(Math.random()*10000));
      var words = [];
      for(var iWord = 0; iWord < nbWords; iWord++){
         words.push(this.formatWord(wordList[iWord]));
      }
      return words;
   };

   this.getRole = function(word,role) {
      switch(role) {
         case "prefix":
            return word.slice(0,this.rng.nextInt(2,word.length - 1));
         case "suffix":
            return word.slice(-this.rng.nextInt(2,word.length - 1));
         case "factor":
            return this.getFactor(word);
         case "subsequence":
            return this.getSubsequence(word);
         case "none":
         default:
            do{ 
               var shuffledWord = Array.from(word);
               this.rng.shuffle(shuffledWord);
               var stringArray = shuffledWord.slice(0,this.rng.nextInt(2,word.length - 1));
               var string = stringArray.toString();
               string = string.replace(/,/gi,"");
            }while(this.isSubsequence("subsequence",string,word));
            return string;
      }
   };

   this.getFactor = function(word) {
      var startIndex = this.rng.nextInt(1,word.length - 3);
      var endIndex = this.rng.nextInt(startIndex + 2, word.length - 1);
      return word.slice(startIndex,endIndex);
   };

   this.getSubsequence = function(word) {
      do{
         var startIndex = this.rng.nextInt(0,word.length - 3);
         var endIndex = this.rng.nextInt(startIndex + 1,word.length);
         var string = word.charAt(startIndex);
         for(var iLetter = startIndex + 1 ; iLetter < endIndex; iLetter++){
            if(this.rng.nextBit()){
               string += word.charAt(iLetter);
            }
         }
         string += word.charAt(endIndex);
      }while(this.isSubsequence("factor",string,word));
      return string;
   };

   this.validation = function(word,answer,length) {
      var error = null;
      for(var type in answer){
         if(type != "seed"){
            if(answer[type].length == 0){
               return "The "+taskStrings[type]+" input is empty";
            }else if(answer[type].length < length){
               return "The "+taskStrings[type]+" input is shorter than "+length;
            }else if(answer[type].length > length){
               return "The "+taskStrings[type]+" input is longer than "+length;
            }
            if(!this.isSubsequence(type,answer[type],word)){
               return answer[type]+" is not a "+type+" of "+word;
            }
            if(type == "factor" || type == "subsequence"){
               if(this.isSubsequence("prefix",answer[type],word)){
                  return "Please enter a "+type+" which is not a prefix";
               }else if(this.isSubsequence("suffix",answer[type],word)){
                  return "Please enter a "+type+" which is not a suffix";
               }
            }
            if(type == "subsequence" && this.isSubsequence("factor",answer[type],word)){
               return "Please enter a "+type+" which is not a factor";
            }
         }
      }
   };

   this.isSubsequence = function(type,string,word) {
      switch(type){
         case "prefix":
            var regex = new RegExp('^'+string);
            break;
         case "suffix":
            var regex = new RegExp(string+'$');
            break;
         case "factor":
            var regex = new RegExp('.*'+string+'.*');
            break;
         case "subsequence":
            var regexStr = "";
            for(var iLetter = 0; iLetter < string.length; iLetter++){
               regexStr += ".*"+string.charAt(iLetter);
            }
            regexStr += ".*";
            var regex = new RegExp(regexStr);
      }
      
      if(regex.test(word)){
         return true;
      }else{
         return false;
      }
   };
};
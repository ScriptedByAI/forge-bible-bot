// ============================================
// trivia.js — Bible Trivia Game Engine
// ============================================
// "Study to shew thyself approved unto God"
// — 2 Timothy 2:15 (KJV)

// Curated Bible trivia questions organized by difficulty
const TRIVIA_QUESTIONS = [
  // ============================================================
  // === EASY (50 questions) ====================================
  // ============================================================
  { q: "Who built the ark?", a: ["noah"], difficulty: "easy", ref: "Genesis 6:14" },
  { q: "How many days did God take to create the world?", a: ["6", "six"], difficulty: "easy", ref: "Genesis 1-2" },
  { q: "What is the first book of the Bible?", a: ["genesis"], difficulty: "easy", ref: "Genesis 1:1" },
  { q: "What is the last book of the Bible?", a: ["revelation", "revelations"], difficulty: "easy", ref: "Revelation 1:1" },
  { q: "Who killed Goliath?", a: ["david"], difficulty: "easy", ref: "1 Samuel 17:50" },
  { q: "What was the name of Jesus' mother?", a: ["mary"], difficulty: "easy", ref: "Luke 1:30-31" },
  { q: "How many apostles did Jesus have?", a: ["12", "twelve"], difficulty: "easy", ref: "Matthew 10:1-4" },
  { q: "Who was swallowed by a great fish?", a: ["jonah"], difficulty: "easy", ref: "Jonah 1:17" },
  { q: "What did God create on the first day?", a: ["light"], difficulty: "easy", ref: "Genesis 1:3" },
  { q: "Who was the first man?", a: ["adam"], difficulty: "easy", ref: "Genesis 2:7" },
  { q: "Who was the first woman?", a: ["eve"], difficulty: "easy", ref: "Genesis 3:20" },
  { q: "What animal tempted Eve in the Garden?", a: ["serpent", "snake"], difficulty: "easy", ref: "Genesis 3:1" },
  { q: "How many commandments did God give Moses?", a: ["10", "ten"], difficulty: "easy", ref: "Exodus 34:28" },
  { q: "Who parted the Red Sea?", a: ["moses"], difficulty: "easy", ref: "Exodus 14:21" },
  { q: "What city did Jesus grow up in?", a: ["nazareth"], difficulty: "easy", ref: "Matthew 2:23" },
  { q: "Who baptized Jesus?", a: ["john", "john the baptist"], difficulty: "easy", ref: "Matthew 3:13" },
  { q: "What is the shortest verse in the Bible (in English)?", a: ["jesus wept"], difficulty: "easy", ref: "John 11:35" },
  { q: "Where was Jesus born?", a: ["bethlehem"], difficulty: "easy", ref: "Matthew 2:1" },
  { q: "What did Jesus turn water into?", a: ["wine"], difficulty: "easy", ref: "John 2:9" },
  { q: "Who denied Jesus three times?", a: ["peter", "simon peter"], difficulty: "easy", ref: "Matthew 26:69-75" },
  { q: "What garden did God place Adam and Eve in?", a: ["eden", "garden of eden"], difficulty: "easy", ref: "Genesis 2:8" },
  { q: "What is the name of the hill where Jesus was crucified?", a: ["golgotha", "calvary"], difficulty: "easy", ref: "Matthew 27:33" },
  { q: "How many days was Jesus in the tomb before He rose?", a: ["3", "three"], difficulty: "easy", ref: "Matthew 12:40" },
  { q: "What weapon did David use to defeat Goliath?", a: ["sling", "slingshot", "sling and stone"], difficulty: "easy", ref: "1 Samuel 17:49" },
  { q: "What did God use to make Eve?", a: ["rib", "adam's rib", "a rib"], difficulty: "easy", ref: "Genesis 2:22" },
  { q: "Who led the Israelites into the Promised Land after Moses?", a: ["joshua"], difficulty: "easy", ref: "Joshua 1:1-2" },
  { q: "What type of animal did Jesus ride into Jerusalem?", a: ["donkey", "colt", "donkey colt"], difficulty: "easy", ref: "Matthew 21:7" },
  { q: "Who betrayed Jesus for 30 pieces of silver?", a: ["judas", "judas iscariot"], difficulty: "easy", ref: "Matthew 26:15" },
  { q: "What did Jesus feed 5,000 people with?", a: ["bread and fish", "fish and bread", "five loaves and two fish", "loaves and fish", "bread fish", "fish bread"], difficulty: "easy", ref: "Matthew 14:17-21" },
  { q: "What did God place in the sky as a promise never to flood the earth again?", a: ["rainbow"], difficulty: "easy", ref: "Genesis 9:13" },
  { q: "What are the first three words of the Bible?", a: ["in the beginning"], difficulty: "easy", ref: "Genesis 1:1" },
  { q: "Who was the brother of Moses?", a: ["aaron"], difficulty: "easy", ref: "Exodus 4:14" },
  { q: "What was the occupation of Jesus' earthly father Joseph?", a: ["carpenter"], difficulty: "easy", ref: "Matthew 13:55" },
  { q: "On which day did God rest from creation?", a: ["7", "seven", "seventh", "7th"], difficulty: "easy", ref: "Genesis 2:2" },
  { q: "Who walked on water with Jesus?", a: ["peter"], difficulty: "easy", ref: "Matthew 14:29" },
  { q: "What did God tell Moses to take off at the burning bush?", a: ["sandals", "shoes", "his sandals", "his shoes"], difficulty: "easy", ref: "Exodus 3:5" },
  { q: "What was baby Jesus laid in after He was born?", a: ["manger"], difficulty: "easy", ref: "Luke 2:7" },
  { q: "What did the wise men follow to find baby Jesus?", a: ["star", "a star"], difficulty: "easy", ref: "Matthew 2:2" },
  { q: "Who was Abraham's wife?", a: ["sarah", "sarai"], difficulty: "easy", ref: "Genesis 17:15" },
  { q: "Which apostle is known as 'doubting'?", a: ["thomas"], difficulty: "easy", ref: "John 20:25" },
  { q: "What was the name of the angel who told Mary she would have a son?", a: ["gabriel"], difficulty: "easy", ref: "Luke 1:26" },
  { q: "What river was Jesus baptized in?", a: ["jordan", "jordan river"], difficulty: "easy", ref: "Matthew 3:13" },
  { q: "Where did Jesus perform His first miracle?", a: ["cana", "wedding at cana"], difficulty: "easy", ref: "John 2:1-11" },
  { q: "What creature spoke to Balaam?", a: ["donkey", "his donkey", "a donkey"], difficulty: "easy", ref: "Numbers 22:28" },
  { q: "What did the burning bush do that was unusual?", a: ["did not burn up", "was not consumed", "didn't burn", "not consumed"], difficulty: "easy", ref: "Exodus 3:2" },
  { q: "Who was the strongest man in the Bible?", a: ["samson"], difficulty: "easy", ref: "Judges 16:3" },
  { q: "What did Jesus walk on during a storm?", a: ["water", "the water", "the sea"], difficulty: "easy", ref: "Matthew 14:25" },
  { q: "How many people went on Noah's ark?", a: ["8", "eight"], difficulty: "easy", ref: "1 Peter 3:20" },
  { q: "Who was thrown into a den of lions?", a: ["daniel"], difficulty: "easy", ref: "Daniel 6:16" },
  { q: "What did Jesus say to calm the storm?", a: ["peace be still", "quiet be still", "be still"], difficulty: "easy", ref: "Mark 4:39" },

  // ============================================================
  // === MEDIUM (70 questions) ==================================
  // ============================================================
  { q: "What are the four Gospels?", a: ["matthew mark luke john", "matthew, mark, luke, john", "matthew mark luke and john"], difficulty: "medium", ref: "New Testament" },
  { q: "Who wrote most of the New Testament epistles?", a: ["paul", "apostle paul", "saul"], difficulty: "medium", ref: "Romans - Philemon" },
  { q: "What was Paul's name before his conversion?", a: ["saul"], difficulty: "medium", ref: "Acts 13:9" },
  { q: "On what road did Paul have his conversion experience?", a: ["damascus", "road to damascus"], difficulty: "medium", ref: "Acts 9:3" },
  { q: "How many books are in the Bible?", a: ["66", "sixty-six", "sixty six"], difficulty: "medium", ref: "The Bible" },
  { q: "What mountain did Moses receive the Ten Commandments on?", a: ["sinai", "mount sinai", "horeb"], difficulty: "medium", ref: "Exodus 19:20" },
  { q: "How many days was Jesus in the wilderness being tempted?", a: ["40", "forty"], difficulty: "medium", ref: "Matthew 4:2" },
  { q: "What giant army did Gideon defeat with only 300 men?", a: ["midianites", "midian"], difficulty: "medium", ref: "Judges 7:7" },
  { q: "Who was the oldest person in the Bible?", a: ["methuselah"], difficulty: "medium", ref: "Genesis 5:27" },
  { q: "What did Esau sell his birthright for?", a: ["stew", "lentil stew", "pottage", "bowl of stew", "lentils", "soup"], difficulty: "medium", ref: "Genesis 25:34" },
  { q: "Which disciple was a tax collector?", a: ["matthew", "levi"], difficulty: "medium", ref: "Matthew 9:9" },
  { q: "What is the longest book of the Bible?", a: ["psalms", "psalm"], difficulty: "medium", ref: "Psalms" },
  { q: "Who interpreted Pharaoh's dreams about seven fat and seven thin cows?", a: ["joseph"], difficulty: "medium", ref: "Genesis 41:25" },
  { q: "How many plagues did God send on Egypt?", a: ["10", "ten"], difficulty: "medium", ref: "Exodus 7-12" },
  { q: "What was the final plague on Egypt?", a: ["death of the firstborn", "firstborn", "death of firstborn", "killing of firstborn"], difficulty: "medium", ref: "Exodus 12:29" },
  { q: "Who replaced Judas as the 12th apostle?", a: ["matthias"], difficulty: "medium", ref: "Acts 1:26" },
  { q: "What fruit is associated with the Tree of Knowledge?", a: ["fruit", "apple", "forbidden fruit"], difficulty: "medium", ref: "Genesis 3:6" },
  { q: "How many days did Jesus stay on earth after His resurrection?", a: ["40", "forty"], difficulty: "medium", ref: "Acts 1:3" },
  { q: "What did manna taste like?", a: ["honey", "wafers made with honey", "honey wafers", "wafers"], difficulty: "medium", ref: "Exodus 16:31" },
  { q: "What were the names of Adam and Eve's first two sons?", a: ["cain and abel", "abel and cain"], difficulty: "medium", ref: "Genesis 4:1-2" },
  { q: "Who was David's best friend?", a: ["jonathan"], difficulty: "medium", ref: "1 Samuel 18:1" },
  { q: "What was the first plague God sent on Egypt?", a: ["water to blood", "blood", "nile turned to blood", "water turned to blood"], difficulty: "medium", ref: "Exodus 7:20" },
  { q: "Who was the wisest king in the Bible?", a: ["solomon"], difficulty: "medium", ref: "1 Kings 4:30" },
  { q: "What did Solomon ask God for?", a: ["wisdom"], difficulty: "medium", ref: "1 Kings 3:9" },
  { q: "How many brothers did Joseph (son of Jacob) have?", a: ["11", "eleven"], difficulty: "medium", ref: "Genesis 37:9" },
  { q: "What coat did Jacob give to Joseph?", a: ["coat of many colors", "many colors", "colorful coat", "coat of many colours"], difficulty: "medium", ref: "Genesis 37:3" },
  { q: "Who was Ruth's mother-in-law?", a: ["naomi"], difficulty: "medium", ref: "Ruth 1:2" },
  { q: "What country did Ruth come from?", a: ["moab"], difficulty: "medium", ref: "Ruth 1:4" },
  { q: "Who cut Samson's hair?", a: ["delilah"], difficulty: "medium", ref: "Judges 16:19" },
  { q: "What was the name of Abraham's first son?", a: ["ishmael"], difficulty: "medium", ref: "Genesis 16:15" },
  { q: "What was Abraham's name before God changed it?", a: ["abram"], difficulty: "medium", ref: "Genesis 17:5" },
  { q: "Who was the mother of Ishmael?", a: ["hagar"], difficulty: "medium", ref: "Genesis 16:15" },
  { q: "What book comes right after the four Gospels?", a: ["acts", "acts of the apostles"], difficulty: "medium", ref: "Acts 1:1" },
  { q: "How many of each animal did Noah take on the ark?", a: ["2", "two"], difficulty: "medium", ref: "Genesis 6:19" },
  { q: "What material was Noah's ark made of?", a: ["gopher wood", "gopherwood", "cypress", "cypress wood"], difficulty: "medium", ref: "Genesis 6:14" },
  { q: "What bird did Noah first send out from the ark?", a: ["raven"], difficulty: "medium", ref: "Genesis 8:7" },
  { q: "What bird brought back an olive branch to Noah?", a: ["dove"], difficulty: "medium", ref: "Genesis 8:11" },
  { q: "What did God rename Jacob?", a: ["israel"], difficulty: "medium", ref: "Genesis 32:28" },
  { q: "Who was Isaac's wife?", a: ["rebekah", "rebecca"], difficulty: "medium", ref: "Genesis 24:67" },
  { q: "What apostle was called 'the Rock' by Jesus?", a: ["peter", "simon peter"], difficulty: "medium", ref: "Matthew 16:18" },
  { q: "What did Jesus say is the greatest commandment?", a: ["love the lord your god", "love god", "love the lord"], difficulty: "medium", ref: "Matthew 22:37" },
  { q: "How many loaves of bread did Jesus use to feed the 5,000?", a: ["5", "five"], difficulty: "medium", ref: "Matthew 14:17" },
  { q: "What kind of tree did Zacchaeus climb to see Jesus?", a: ["sycamore", "sycamore fig", "sycamore tree"], difficulty: "medium", ref: "Luke 19:4" },
  { q: "What happened to Lot's wife when she looked back at Sodom?", a: ["turned to salt", "pillar of salt", "became a pillar of salt", "turned into a pillar of salt", "salt"], difficulty: "medium", ref: "Genesis 19:26" },
  { q: "Who anointed David as king?", a: ["samuel"], difficulty: "medium", ref: "1 Samuel 16:13" },
  { q: "What instrument did David play?", a: ["harp", "lyre"], difficulty: "medium", ref: "1 Samuel 16:23" },
  { q: "What part of his body did Jacob injure while wrestling with God?", a: ["hip", "thigh", "hip socket"], difficulty: "medium", ref: "Genesis 32:25" },
  { q: "How many spies did Moses send into Canaan?", a: ["12", "twelve"], difficulty: "medium", ref: "Numbers 13:1-16" },
  { q: "Who were the two faithful spies?", a: ["joshua and caleb", "caleb and joshua"], difficulty: "medium", ref: "Numbers 14:6" },
  { q: "What happened when Joshua marched around the walls of Jericho?", a: ["walls fell down", "they fell", "walls collapsed", "the walls fell"], difficulty: "medium", ref: "Joshua 6:20" },
  { q: "How many times did the Israelites march around Jericho on the last day?", a: ["7", "seven"], difficulty: "medium", ref: "Joshua 6:15" },
  { q: "What parable talks about a man who was beaten and left on the road?", a: ["good samaritan", "the good samaritan"], difficulty: "medium", ref: "Luke 10:30-37" },
  { q: "What is the 23rd Psalm about?", a: ["the lord is my shepherd", "shepherd", "the lord my shepherd"], difficulty: "medium", ref: "Psalm 23:1" },
  { q: "Who wrote the book of Acts?", a: ["luke"], difficulty: "medium", ref: "Acts 1:1" },
  { q: "Who was the twin brother of Jacob?", a: ["esau"], difficulty: "medium", ref: "Genesis 25:25-26" },
  { q: "What was the name of the garden where Jesus prayed before His arrest?", a: ["gethsemane", "garden of gethsemane"], difficulty: "medium", ref: "Matthew 26:36" },
  { q: "Who asked for Jesus' body after the crucifixion?", a: ["joseph of arimathea", "joseph"], difficulty: "medium", ref: "Matthew 27:57-58" },
  { q: "What was Rahab's occupation?", a: ["prostitute", "harlot"], difficulty: "medium", ref: "Joshua 2:1" },
  { q: "What city was known for its great wall that Rahab lived on?", a: ["jericho"], difficulty: "medium", ref: "Joshua 2:1" },
  { q: "What body of water did the Israelites cross on dry ground to enter the Promised Land?", a: ["jordan", "jordan river"], difficulty: "medium", ref: "Joshua 3:17" },
  { q: "What sign did God give to confirm Gideon's calling?", a: ["fleece", "wet fleece", "fleece of wool"], difficulty: "medium", ref: "Judges 6:37" },
  { q: "What did the people build to try to reach heaven?", a: ["tower of babel", "babel", "a tower"], difficulty: "medium", ref: "Genesis 11:4" },
  { q: "What happened at the Tower of Babel?", a: ["languages were confused", "god confused their language", "confused languages", "language confused"], difficulty: "medium", ref: "Genesis 11:7" },
  { q: "In the Parable of the Prodigal Son, what animal food did the son eat?", a: ["pig food", "pig pods", "pods", "husks", "swine food", "pig slop", "slop", "carob pods"], difficulty: "medium", ref: "Luke 15:16" },
  { q: "What prison did Paul and Silas sing hymns in before an earthquake opened the doors?", a: ["philippi", "philippian jail", "philippian prison"], difficulty: "medium", ref: "Acts 16:25-26" },
  { q: "What is the Fruit of the Spirit passage reference?", a: ["galatians 5", "galatians 5:22", "galatians 5:22-23"], difficulty: "medium", ref: "Galatians 5:22-23" },
  { q: "How many of the spies gave a good report about Canaan?", a: ["2", "two"], difficulty: "medium", ref: "Numbers 14:6-8" },
  { q: "What was the name of the sea Jesus walked on?", a: ["galilee", "sea of galilee"], difficulty: "medium", ref: "Matthew 14:25" },
  { q: "Who was raised from the dead by Jesus after being in the tomb four days?", a: ["lazarus"], difficulty: "medium", ref: "John 11:43-44" },
  { q: "What psalm begins 'The Lord is my shepherd'?", a: ["psalm 23", "psalms 23", "23"], difficulty: "medium", ref: "Psalm 23:1" },

  // ============================================================
  // === HARD (70 questions) ====================================
  // ============================================================
  { q: "What were the names of the two pillars in Solomon's temple?", a: ["jachin and boaz", "boaz and jachin", "jachin boaz"], difficulty: "hard", ref: "1 Kings 7:21" },
  { q: "Who was the only female judge of Israel?", a: ["deborah"], difficulty: "hard", ref: "Judges 4:4" },
  { q: "What is the longest chapter in the Bible?", a: ["psalm 119", "psalms 119"], difficulty: "hard", ref: "Psalm 119" },
  { q: "How old was Methuselah when he died?", a: ["969"], difficulty: "hard", ref: "Genesis 5:27" },
  { q: "What queen visited Solomon to test his wisdom?", a: ["sheba", "queen of sheba"], difficulty: "hard", ref: "1 Kings 10:1" },
  { q: "Who was the first king of Israel?", a: ["saul"], difficulty: "hard", ref: "1 Samuel 10:1" },
  { q: "How many sons did Jacob have?", a: ["12", "twelve"], difficulty: "hard", ref: "Genesis 35:22" },
  { q: "What Old Testament prophet was taken to heaven in a chariot of fire?", a: ["elijah"], difficulty: "hard", ref: "2 Kings 2:11" },
  { q: "What is the shortest chapter in the Bible?", a: ["psalm 117", "psalms 117"], difficulty: "hard", ref: "Psalm 117" },
  { q: "What were the names of Moses' siblings?", a: ["aaron and miriam", "miriam and aaron", "aaron miriam"], difficulty: "hard", ref: "Exodus 15:20" },
  { q: "Who said 'Am I my brother's keeper?'", a: ["cain"], difficulty: "hard", ref: "Genesis 4:9" },
  { q: "What book comes right before Revelation?", a: ["jude"], difficulty: "hard", ref: "Jude 1:1" },
  { q: "What prophet was commanded to marry an unfaithful woman?", a: ["hosea"], difficulty: "hard", ref: "Hosea 1:2" },
  { q: "Who was the father of John the Baptist?", a: ["zechariah", "zacharias", "zachariah"], difficulty: "hard", ref: "Luke 1:13" },
  { q: "What two Old Testament figures appeared with Jesus at the Transfiguration?", a: ["moses and elijah", "elijah and moses", "moses elijah"], difficulty: "hard", ref: "Matthew 17:3" },
  { q: "What church in Revelation was told it was 'lukewarm'?", a: ["laodicea", "laodicean", "laodiceans"], difficulty: "hard", ref: "Revelation 3:16" },
  { q: "What is the 'Armor of God' passage reference?", a: ["ephesians 6", "ephesians 6:10-18", "ephesians 6:10", "eph 6"], difficulty: "hard", ref: "Ephesians 6:10-18" },
  { q: "How many books are in the Old Testament?", a: ["39", "thirty-nine", "thirty nine"], difficulty: "hard", ref: "Old Testament" },
  { q: "How many books are in the New Testament?", a: ["27", "twenty-seven", "twenty seven"], difficulty: "hard", ref: "New Testament" },
  { q: "Who was the Roman governor who sentenced Jesus to death?", a: ["pilate", "pontius pilate"], difficulty: "hard", ref: "Matthew 27:26" },
  { q: "What prophet saw a valley of dry bones come to life?", a: ["ezekiel"], difficulty: "hard", ref: "Ezekiel 37:1-10" },
  { q: "What were the names of Daniel's three friends thrown into the fiery furnace?", a: ["shadrach meshach abednego", "shadrach, meshach, and abednego", "shadrach meshach and abednego"], difficulty: "hard", ref: "Daniel 3:12" },
  { q: "Who was the prophet that confronted King David about his sin with Bathsheba?", a: ["nathan"], difficulty: "hard", ref: "2 Samuel 12:1" },
  { q: "How many churches are addressed in the book of Revelation?", a: ["7", "seven"], difficulty: "hard", ref: "Revelation 2-3" },
  { q: "What disciple was called 'the disciple whom Jesus loved'?", a: ["john"], difficulty: "hard", ref: "John 13:23" },
  { q: "What is the name of the place where the final battle is prophesied in Revelation?", a: ["armageddon", "har-magedon", "megiddo"], difficulty: "hard", ref: "Revelation 16:16" },
  { q: "Who was the king that tried to kill baby Jesus?", a: ["herod", "king herod", "herod the great"], difficulty: "hard", ref: "Matthew 2:16" },
  { q: "What was the name of Abraham's nephew?", a: ["lot"], difficulty: "hard", ref: "Genesis 12:5" },
  { q: "What Old Testament book never mentions the name of God?", a: ["esther"], difficulty: "hard", ref: "Esther" },
  { q: "What prophet was fed by ravens?", a: ["elijah"], difficulty: "hard", ref: "1 Kings 17:6" },
  { q: "What prophet succeeded Elijah?", a: ["elisha"], difficulty: "hard", ref: "2 Kings 2:13-15" },
  { q: "What woman hid the Israelite spies in Jericho?", a: ["rahab"], difficulty: "hard", ref: "Joshua 2:6" },
  { q: "Who was the son of David that tried to steal the throne?", a: ["absalom"], difficulty: "hard", ref: "2 Samuel 15:10" },
  { q: "What did God tell Abraham to sacrifice on Mount Moriah?", a: ["isaac", "his son", "his son isaac"], difficulty: "hard", ref: "Genesis 22:2" },
  { q: "What animal was provided as a substitute sacrifice for Isaac?", a: ["ram", "a ram"], difficulty: "hard", ref: "Genesis 22:13" },
  { q: "Who dreamed about a ladder reaching to heaven?", a: ["jacob"], difficulty: "hard", ref: "Genesis 28:12" },
  { q: "What two cities did God destroy with fire and brimstone?", a: ["sodom and gomorrah", "gomorrah and sodom"], difficulty: "hard", ref: "Genesis 19:24" },
  { q: "What book of the Bible is a love poem?", a: ["song of solomon", "song of songs"], difficulty: "hard", ref: "Song of Solomon 1:1" },
  { q: "How many pieces of silver was Joseph sold for by his brothers?", a: ["20", "twenty"], difficulty: "hard", ref: "Genesis 37:28" },
  { q: "What island was Paul shipwrecked on?", a: ["malta"], difficulty: "hard", ref: "Acts 28:1" },
  { q: "What was the name of Timothy's grandmother?", a: ["lois"], difficulty: "hard", ref: "2 Timothy 1:5" },
  { q: "What was the name of Timothy's mother?", a: ["eunice"], difficulty: "hard", ref: "2 Timothy 1:5" },
  { q: "Who was the high priest who questioned Jesus before His crucifixion?", a: ["caiaphas"], difficulty: "hard", ref: "Matthew 26:57" },
  { q: "What field was bought with Judas' 30 pieces of silver?", a: ["field of blood", "akeldama", "potter's field"], difficulty: "hard", ref: "Acts 1:19" },
  { q: "Who was the first Christian martyr?", a: ["stephen"], difficulty: "hard", ref: "Acts 7:59-60" },
  { q: "What Babylonian king went mad and ate grass like an animal?", a: ["nebuchadnezzar"], difficulty: "hard", ref: "Daniel 4:33" },
  { q: "What does 'Immanuel' mean?", a: ["god with us", "god is with us"], difficulty: "hard", ref: "Matthew 1:23" },
  { q: "How many years did the Israelites wander in the wilderness?", a: ["40", "forty"], difficulty: "hard", ref: "Numbers 14:33" },
  { q: "What prophet challenged the prophets of Baal on Mount Carmel?", a: ["elijah"], difficulty: "hard", ref: "1 Kings 18:19" },
  { q: "What was written on the wall at Belshazzar's feast?", a: ["mene mene tekel upharsin", "mene mene tekel parsin", "mene tekel"], difficulty: "hard", ref: "Daniel 5:25" },
  { q: "Who interpreted the writing on the wall for Belshazzar?", a: ["daniel"], difficulty: "hard", ref: "Daniel 5:26" },
  { q: "Who was the first person to see the risen Jesus?", a: ["mary magdalene", "mary"], difficulty: "hard", ref: "Mark 16:9" },
  { q: "What did Elisha ask for from Elijah before he was taken up?", a: ["double portion", "double portion of his spirit", "double portion of your spirit"], difficulty: "hard", ref: "2 Kings 2:9" },
  { q: "What tribe of Israel served as the priests?", a: ["levi", "levites", "tribe of levi"], difficulty: "hard", ref: "Numbers 3:6" },
  { q: "What prophet was thrown into a cistern of mud?", a: ["jeremiah"], difficulty: "hard", ref: "Jeremiah 38:6" },
  { q: "What Ethiopian official did Philip baptize?", a: ["eunuch", "ethiopian eunuch", "the eunuch"], difficulty: "hard", ref: "Acts 8:38" },
  { q: "What is the name of the pool in Jerusalem where Jesus healed a blind man?", a: ["siloam", "pool of siloam"], difficulty: "hard", ref: "John 9:7" },
  { q: "How many baskets of leftovers were collected after Jesus fed the 5,000?", a: ["12", "twelve"], difficulty: "hard", ref: "Matthew 14:20" },
  { q: "What woman was the first convert in Europe mentioned in Acts?", a: ["lydia"], difficulty: "hard", ref: "Acts 16:14" },
  { q: "What was the name of Hosea's unfaithful wife?", a: ["gomer"], difficulty: "hard", ref: "Hosea 1:3" },
  { q: "What is the book of Proverbs primarily attributed to?", a: ["solomon", "king solomon"], difficulty: "hard", ref: "Proverbs 1:1" },
  { q: "What magician tried to buy the power of the Holy Spirit?", a: ["simon", "simon magus", "simon the sorcerer"], difficulty: "hard", ref: "Acts 8:18-19" },
  { q: "What is the middle chapter of the Bible?", a: ["psalm 118", "psalms 118"], difficulty: "hard", ref: "Psalm 118" },
  { q: "What prophet was told to bake bread over cow dung?", a: ["ezekiel"], difficulty: "hard", ref: "Ezekiel 4:15" },
  { q: "What city was Saul traveling to when Jesus appeared to him?", a: ["damascus"], difficulty: "hard", ref: "Acts 9:3" },
  { q: "Who had a coat of camel's hair and ate locusts and wild honey?", a: ["john the baptist", "john"], difficulty: "hard", ref: "Matthew 3:4" },
  { q: "What was the last thing Jesus said on the cross according to Luke?", a: ["father into your hands i commit my spirit", "into your hands i commit my spirit", "into thy hands i commend my spirit"], difficulty: "hard", ref: "Luke 23:46" },
  { q: "How many wise men visited baby Jesus?", a: ["the bible doesn't say", "unknown", "doesn't say", "it doesn't say", "bible doesn't say", "we don't know"], difficulty: "hard", ref: "Matthew 2:1" },
  { q: "What Old Testament figure was sold into slavery by his brothers and later became second-in-command of Egypt?", a: ["joseph"], difficulty: "hard", ref: "Genesis 41:41" },
];

// ============================================
// ANSWER MATCHING UTILITIES
// ============================================

/**
 * Calculate Levenshtein distance between two strings.
 * Used for typo tolerance in answer checking.
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalize a string for comparison:
 * Lowercase, trim, collapse whitespace, normalize quotes
 */
function normalizeAnswer(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/['\u2018\u2019]/g, "'")
    .replace(/["\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ');
}

/**
 * Extract meaningful words from a string (ignore articles, etc.)
 */
function getKeyWords(str) {
  const noise = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'and', 'or', 'is', 'it', 'was', 'his', 'her', 'its']);
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0 && !noise.has(w));
}

/**
 * Flexible answer matching — checks multiple strategies:
 *
 * 1. Exact match (case-insensitive)
 * 2. User message contains the full answer
 * 3. Answer contains the user's message (word boundary, min 3 chars)
 * 4. All key words in user's message exist in the answer (or vice versa)
 * 5. Levenshtein distance for typo tolerance
 *
 * @param {string} userMessage - What the user typed
 * @param {string[]} acceptedAnswers - Array of accepted answers
 * @returns {boolean} - Whether the answer should be accepted
 */
function isAnswerCorrect(userMessage, acceptedAnswers) {
  const cleanMsg = normalizeAnswer(userMessage);

  // Ignore very short or empty messages
  if (cleanMsg.length < 1) return false;

  for (const answer of acceptedAnswers) {
    const cleanAnswer = normalizeAnswer(answer);

    // --- Strategy 1: Exact match ---
    if (cleanMsg === cleanAnswer) return true;

    // --- Strategy 2: User message contains the full answer ---
    if (cleanMsg.includes(cleanAnswer)) return true;

    // --- Strategy 3: Answer contains user's message ---
    // Only if user typed something meaningful (3+ chars) and it matches
    // at a word boundary to avoid partial-word false positives
    if (cleanMsg.length >= 3 && cleanAnswer.includes(cleanMsg)) {
      // Check word boundary: "pig" should match in "pig food" but
      // "dam" shouldn't match "adam" (unless "dam" is its own word)
      const escapedMsg = cleanMsg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp('(?:^|\\s)' + escapedMsg + '(?:\\s|$)');
      if (wordBoundaryRegex.test(cleanAnswer) || cleanAnswer.startsWith(cleanMsg)) {
        return true;
      }
    }

    // --- Strategy 4: Key word overlap ---
    // All key words in the user's message appear in the answer (or vice versa)
    const userWords = getKeyWords(cleanMsg);
    const answerWords = getKeyWords(cleanAnswer);

    if (userWords.length > 0 && answerWords.length > 0) {
      // If every key word the user typed appears in the answer
      const allUserWordsInAnswer = userWords.every(uw =>
        answerWords.some(aw => aw === uw || aw.startsWith(uw) || uw.startsWith(aw))
      );
      if (allUserWordsInAnswer && userWords.length >= 1) return true;

      // If every key word in the answer appears in user's message
      const allAnswerWordsInUser = answerWords.every(aw =>
        userWords.some(uw => uw === aw || uw.startsWith(aw) || aw.startsWith(uw))
      );
      if (allAnswerWordsInUser && answerWords.length >= 1) return true;
    }

    // --- Strategy 5: Typo tolerance (Levenshtein) ---
    // Allow small typos for longer words/answers
    if (cleanMsg.length >= 4 && cleanAnswer.length >= 4) {
      const distance = levenshteinDistance(cleanMsg, cleanAnswer);
      // Allow 1 typo for words 4-7 chars, 2 typos for 8+ chars
      const maxDistance = cleanAnswer.length >= 8 ? 2 : 1;
      if (distance <= maxDistance) return true;
    }
  }

  return false;
}

// ============================================
// TRIVIA GAME CLASS
// ============================================

class TriviaGame {
  constructor(storage) {
    this.storage = storage;

    // Active trivia sessions per channel
    // Key: channel -> { question, answers, difficulty, ref, startTime, timeout }
    this.activeSessions = new Map();

    // Track recently asked questions per channel to avoid repeats
    // Key: channel -> Array of question texts (last N asked)
    this.recentQuestions = new Map();
    this.maxRecentTracked = 20; // Don't repeat last 20 questions

    // Callback for when a question expires (set by command handlers)
    this.onExpire = null;
  }

  /**
   * Start a new trivia question for a channel
   * Returns the question text or null if one is already active
   */
  startQuestion(channel, difficulty = null) {
    // Check if a question is already active in this channel
    if (this.activeSessions.has(channel)) {
      return null; // Already active
    }

    // Filter by difficulty if specified
    let pool = TRIVIA_QUESTIONS;
    if (difficulty) {
      pool = pool.filter(q => q.difficulty === difficulty);
    }

    // Get recent question list for this channel
    if (!this.recentQuestions.has(channel)) {
      this.recentQuestions.set(channel, []);
    }
    const recent = this.recentQuestions.get(channel);

    // Filter out recently asked questions
    let availablePool = pool.filter(q => !recent.includes(q.q));

    // If we've exhausted the pool, reset recent tracking
    if (availablePool.length === 0) {
      this.recentQuestions.set(channel, []);
      availablePool = pool;
    }

    // Pick random question from available pool
    const question = availablePool[Math.floor(Math.random() * availablePool.length)];

    // Track this question as recently asked
    recent.push(question.q);
    if (recent.length > this.maxRecentTracked) {
      recent.shift(); // Remove oldest tracked question
    }

    const session = {
      question: question.q,
      answers: question.a,
      difficulty: question.difficulty,
      ref: question.ref,
      startTime: Date.now(),
      answered: false,
    };

    this.activeSessions.set(channel, session);

    // Auto-expire after 30 seconds
    session.timeout = setTimeout(() => {
      if (this.activeSessions.has(channel) && !this.activeSessions.get(channel).answered) {
        const expired = this.activeSessions.get(channel);
        this.activeSessions.delete(channel);
        // Notify chat that time's up
        if (this.onExpire) {
          this.onExpire(channel, expired.answers[0], expired.ref);
        }
      }
    }, 30000);

    const diffEmoji = { easy: '\u{1F7E2}', medium: '\u{1F7E1}', hard: '\u{1F534}' };
    return {
      text: `${diffEmoji[question.difficulty] || '\u2753'} **Bible Trivia** (${question.difficulty}): ${question.q}`,
      twitchText: `${diffEmoji[question.difficulty] || '\u2753'} Bible Trivia (${question.difficulty}): ${question.q} \u2014 Type your answer in chat! (30 seconds)`,
    };
  }

  /**
   * Check if a chat message is the correct answer
   * Returns { correct: boolean, winner: string, answer: string, ref: string, score: object } or null
   */
  checkAnswer(channel, message, username) {
    const session = this.activeSessions.get(channel);
    if (!session || session.answered) return null;

    const cleanMsg = message.trim();

    // Use flexible answer matching
    if (isAnswerCorrect(cleanMsg, session.answers)) {
      session.answered = true;
      clearTimeout(session.timeout);
      this.activeSessions.delete(channel);

      // Record score
      const score = this.storage.recordTriviaAnswer(username, true);
      const elapsed = ((Date.now() - session.startTime) / 1000).toFixed(1);

      return {
        correct: true,
        winner: username,
        answer: session.answers[0],
        ref: session.ref,
        difficulty: session.difficulty,
        score: score,
        elapsed: elapsed,
      };
    }

    return null;
  }

  /**
   * End the current trivia session (time's up)
   */
  expireQuestion(channel) {
    const session = this.activeSessions.get(channel);
    if (!session) return null;

    clearTimeout(session.timeout);
    this.activeSessions.delete(channel);

    return {
      answer: session.answers[0],
      ref: session.ref,
    };
  }

  /**
   * Check if a trivia session is active in a channel
   */
  isActive(channel) {
    return this.activeSessions.has(channel) && !this.activeSessions.get(channel).answered;
  }

  /**
   * Get remaining time for active question
   */
  getTimeRemaining(channel) {
    const session = this.activeSessions.get(channel);
    if (!session) return 0;
    const elapsed = Date.now() - session.startTime;
    return Math.max(0, 30000 - elapsed);
  }
}

module.exports = TriviaGame;

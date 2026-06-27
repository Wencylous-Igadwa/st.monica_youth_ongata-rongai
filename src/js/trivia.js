import { gsap, ScrollTrigger } from './gsap.js';
import { initLenis }          from './lenis.js';
import { initNavbar }         from './navbar.js';
import { initLoader }         from './loader.js';
import { initInertia }        from './utils/inertia.js';

const VERSES = [
  { text: 'For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life.', ref: 'John 3:16' },
  { text: 'I can do all things through him who strengthens me.', ref: 'Philippians 4:13' },
  { text: 'The Lord is my shepherd; I shall not want.', ref: 'Psalm 23:1' },
  { text: 'Trust in the Lord with all your heart, and do not lean on your own understanding.', ref: 'Proverbs 3:5' },
  { text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', ref: 'Joshua 1:9' },
  { text: 'The Lord bless you and keep you; the Lord make his face to shine upon you and be gracious to you.', ref: 'Numbers 6:24-25' },
  { text: 'Your word is a lamp to my feet and a light to my path.', ref: 'Psalm 119:105' },
  { text: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.', ref: 'Philippians 4:6' },
  { text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.', ref: 'Isaiah 40:31' },
  { text: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.', ref: 'Lamentations 3:22-23' },
  { text: 'Be still, and know that I am God.', ref: 'Psalm 46:10' },
  { text: 'I have fought the good fight, I have finished the race, I have kept the faith.', ref: '2 Timothy 4:7' },
  { text: 'And now these three remain: faith, hope and love. But the greatest of these is love.', ref: '1 Corinthians 13:13' },
  { text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.', ref: 'Jeremiah 29:11' },
  { text: 'The joy of the Lord is your strength.', ref: 'Nehemiah 8:10' },
  { text: 'God is our refuge and strength, an ever-present help in trouble.', ref: 'Psalm 46:1' },
  { text: 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.', ref: 'Matthew 7:7' },
  { text: 'Blessed are the pure in heart, for they shall see God.', ref: 'Matthew 5:8' },
  { text: 'Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.', ref: 'Matthew 5:16' },
  { text: 'The Lord is near to all who call on him, to all who call on him in truth.', ref: 'Psalm 145:18' },
];

const QUESTIONS = [
  { q: 'How many books are in the Catholic Bible?', opts: ['66', '73', '46', '27'], ans: 1 },
  { q: 'Which apostle is considered the first Pope?', opts: ['Paul', 'John', 'Peter', 'James'], ans: 2 },
  { q: 'What is the last book of the Bible?', opts: ['Genesis', 'Revelation', 'Acts', 'Exodus'], ans: 1 },
  { q: 'How many days did God create the world according to Genesis?', opts: ['5', '6', '7', '10'], ans: 1 },
  { q: 'Who wrote the majority of the Psalms?', opts: ['Solomon', 'Moses', 'David', 'Isaiah'], ans: 2 },
  { q: 'Which sacrament is the "source and summit" of the Christian life?', opts: ['Baptism', 'Confirmation', 'Eucharist', 'Reconciliation'], ans: 2 },
  { q: 'Which Gospel is the longest?', opts: ['Matthew', 'Mark', 'Luke', 'John'], ans: 2 },
  { q: 'How many people were on Noah\'s Ark?', opts: ['4', '6', '8', '12'], ans: 2 },
  { q: 'What did God create on the fourth day?', opts: ['Land and sea', 'Sun, moon, and stars', 'Birds and fish', 'Plants and trees'], ans: 1 },
  { q: 'Who was the mother of Jesus?', opts: ['Martha', 'Mary', 'Elizabeth', 'Anna'], ans: 1 },
  { q: 'How many loaves and fish did Jesus multiply to feed the 5,000?', opts: ['3 loaves, 2 fish', '5 loaves, 2 fish', '7 loaves, 3 fish', '2 loaves, 5 fish'], ans: 1 },
  { q: 'Which Old Testament figure is known for his strength from his hair?', opts: ['Samuel', 'Samson', 'Saul', 'Solomon'], ans: 1 },
  { q: 'What is the first commandment?', opts: ['You shall not kill', 'Honor your father and mother', 'You shall have no other gods before me', 'You shall not steal'], ans: 2 },
  { q: 'Who was the first martyr of the Church?', opts: ['Peter', 'Paul', 'Stephen', 'James'], ans: 2 },
  { q: 'Which book of the Bible is also known as "The Preacher"?', opts: ['Proverbs', 'Ecclesiastes', 'Job', 'Song of Solomon'], ans: 1 },
  { q: 'How many Stations of the Cross are there?', opts: ['12', '14', '7', '10'], ans: 1 },
  { q: 'Who said "Here I am, send me" to God\'s call?', opts: ['Jeremiah', 'Isaiah', 'Ezekiel', 'Amos'], ans: 1 },
  { q: 'What are the three theological virtues?', opts: ['Faith, Hope, Charity', 'Prudence, Justice, Temperance', 'Fortitude, Wisdom, Understanding', 'Love, Joy, Peace'], ans: 0 },
  { q: 'Which apostle was a tax collector before following Jesus?', opts: ['Peter', 'Matthew', 'Thomas', 'Andrew'], ans: 1 },
  { q: 'How many days was Jesus in the tomb before the Resurrection?', opts: ['2', '3', '4', '7'], ans: 1 },
  { q: 'Who is the patron saint of impossible causes?', opts: ['St. Jude', 'St. Peter', 'St. Paul', 'St. John'], ans: 0 },
  { q: 'What is the Annunciation?', opts: ['Jesus\' birth', 'Angel Gabriel telling Mary she would bear Jesus', 'Mary\'s assumption', 'Jesus\' resurrection'], ans: 1 },
  { q: 'How many sacraments are in the Catholic Church?', opts: ['5', '6', '7', '8'], ans: 2 },
  { q: 'What does "Eucharist" mean?', opts: ['Sacrifice', 'Thanksgiving', 'Memorial', 'Covenant'], ans: 1 },
  { q: 'Who was the foster father of Jesus?', opts: ['Joseph', 'Joachim', 'Zechariah', 'Abraham'], ans: 0 },
  { q: 'Which Gospel writer is symbolized by an eagle?', opts: ['Matthew', 'Mark', 'Luke', 'John'], ans: 3 },
  { q: 'What is the Immaculate Conception?', opts: ['Jesus\' conception', 'Mary conceived without original sin', 'Virgin birth', 'John the Baptist\'s birth'], ans: 1 },
  { q: 'How many books are in the New Testament?', opts: ['21', '27', '33', '39'], ans: 1 },
  { q: 'Which mountain did Moses receive the Ten Commandments?', opts: ['Mount Zion', 'Mount Sinai', 'Mount Carmel', 'Mount Tabor'], ans: 1 },
  { q: 'What is the third person of the Holy Trinity?', opts: ['Jesus', 'Holy Spirit', 'Mary', 'God the Father'], ans: 1 },
  { q: 'How many apostles did Jesus choose?', opts: ['7', '10', '12', '14'], ans: 2 },
  { q: 'What is the day of Pentecost?', opts: ['Jesus\' ascension', 'Descent of the Holy Spirit', 'Mary\'s assumption', 'Crucifixion'], ans: 1 },
  { q: 'Which saint is known as the "Little Flower"?', opts: ['St. Therese of Lisieux', 'St. Joan of Arc', 'St. Clare', 'St. Bernadette'], ans: 0 },
  { q: 'What are the four cardinal virtues?', opts: ['Faith, Hope, Love, Prudence', 'Prudence, Justice, Fortitude, Temperance', 'Wisdom, Understanding, Counsel, Fortitude', 'Charity, Joy, Peace, Patience'], ans: 1 },
  { q: 'Which city is the seat of the Pope?', opts: ['Jerusalem', 'Assisi', 'Rome', 'Florence'], ans: 2 },
  { q: 'What is the Rosary primarily?', opts: ['A prayer to saints', 'A meditation on the life of Christ through Mary', 'A reading of Psalms', 'A fasting practice'], ans: 1 },
  { q: 'Who was the first king of Israel?', opts: ['David', 'Solomon', 'Saul', 'Samuel'], ans: 2 },
  { q: 'Which gospel is the shortest?', opts: ['Matthew', 'Mark', 'Luke', 'John'], ans: 1 },
  { q: 'How many days did Jesus fast in the desert?', opts: ['7', '20', '40', '30'], ans: 2 },
  { q: 'What are the Sorrowful Mysteries of the Rosary about?', opts: ['Christ\'s childhood', 'Christ\'s passion and death', 'Christ\'s resurrection', 'Mary\'s life'], ans: 1 },
  { q: 'Which apostle denied Jesus three times?', opts: ['Peter', 'Thomas', 'James', 'Andrew'], ans: 0 },
  { q: 'What is the official language of the Latin Rite Catholic Church?', opts: ['Greek', 'Hebrew', 'Latin', 'Aramaic'], ans: 2 },
  { q: 'How many books are in the Old Testament?', opts: ['39', '46', '27', '73'], ans: 1 },
  { q: 'What is a deacon?', opts: ['A lay minister', 'The first degree of Holy Orders', 'A bishop in training', 'A religious brother'], ans: 1 },
  { q: 'Who is the patron saint of travelers?', opts: ['St. Peter', 'St. Christopher', 'St. George', 'St. Patrick'], ans: 1 },
  { q: 'What does "Amen" mean?', opts: ['So be it', 'Praise God', 'Thank you', 'Hear us'], ans: 0 },
  { q: 'How many books are in the Torah?', opts: ['3', '5', '7', '12'], ans: 1 },
  { q: 'Which miracle did Jesus perform at the Wedding at Cana?', opts: ['Healed a blind man', 'Turned water into wine', 'Fed 5,000', 'Walked on water'], ans: 1 },
  { q: 'What is the Catechism?', opts: ['A prayer book', 'A summary of Catholic doctrine', 'The Bible commentary', 'A hymnal'], ans: 1 },
  { q: 'Who wrote the Gospel of Mark based on tradition?', opts: ['Mark himself', 'Peter\'s teachings', 'Paul\'s letters', 'Luke\'s accounts'], ans: 1 },
  { q: 'What is a monstrance used for?', opts: ['Baptism', 'Exposition of the Eucharist', 'Anointing the sick', 'Confirmation'], ans: 1 },
  { q: 'Which saint converted St. Augustine?', opts: ['St. Ambrose', 'St. Jerome', 'St. Monica', 'St. Gregory'], ans: 2 },
  { q: 'How many chapters are in the Gospel of John?', opts: ['21', '24', '16', '28'], ans: 0 },
  { q: 'What are the Luminous Mysteries?', opts: ['Christ\'s infancy', 'Christ\'s public ministry', 'Christ\'s passion', 'Mary\'s sorrows'], ans: 1 },
  { q: 'Who is the patron saint of lost items?', opts: ['St. Jude', 'St. Anthony of Padua', 'St. Francis', 'St. Dominic'], ans: 1 },
  { q: 'What is the term for being freed from punishment due to sin?', opts: ['Grace', 'Indulgence', 'Purgatory', 'Absolution'], ans: 1 },
  { q: 'How many fruits of the Holy Spirit are there?', opts: ['7', '9', '12', '15'], ans: 2 },
  { q: 'Which book of the Bible describes the creation of the world?', opts: ['Exodus', 'Genesis', 'Leviticus', 'Deuteronomy'], ans: 1 },
  { q: 'What is "lectio divina"?', opts: ['A type of mass', 'Sacred reading and meditation on Scripture', 'A Eucharistic prayer', 'A blessing'], ans: 1 },
  { q: 'Who was the mother of John the Baptist?', opts: ['Mary', 'Elizabeth', 'Anne', 'Martha'], ans: 1 },
  { q: 'How many candles are on an Advent wreath?', opts: ['2', '3', '4', '5'], ans: 2 },
  { q: 'What does "Transubstantiation" mean?', opts: ['Symbolic presence', 'The bread and wine become the Body and Blood of Christ', 'Spiritual communion', 'Blessing of elements'], ans: 1 },
  { q: 'Which apostle is known as the "Doubting Thomas"?', opts: ['Thomas', 'Matthew', 'Bartholomew', 'Philip'], ans: 0 },
  { q: 'What is the season of Lent?', opts: ['A celebration of Easter', 'A 40-day period of penance and preparation', 'A Christmas preparation', 'A feast of saints'], ans: 1 },
  { q: 'Who is the patron saint of animals?', opts: ['St. Dominic', 'St. Francis of Assisi', 'St. Benedict', 'St. Ignatius'], ans: 1 },
  { q: 'What is the Holy Trinity?', opts: ['Father, Son, and Holy Spirit', 'Mary, Joseph, and Jesus', 'Peter, James, and John', 'Faith, Hope, and Charity'], ans: 0 },
  { q: 'Which Psalm begins "The Lord is my shepherd"?', opts: ['Psalm 1', 'Psalm 23', 'Psalm 51', 'Psalm 150'], ans: 1 },
  { q: 'How many gifts of the Holy Spirit are there?', opts: ['5', '7', '9', '12'], ans: 1 },
  { q: 'What happened on Good Friday?', opts: ['Jesus rose', 'Jesus was crucified', 'Holy Spirit descended', 'Jesus was born'], ans: 1 },
  { q: 'What is the Magisterium?', opts: ['The Bible', 'The teaching authority of the Church', 'The Vatican museum', 'The college of cardinals'], ans: 1 },
  { q: 'Who was the first woman according to the Bible?', opts: ['Eve', 'Sarah', 'Rebecca', 'Leah'], ans: 0 },
  { q: 'Which saint is the patron of parish youth groups?', opts: ['St. John Bosco', 'St. Dominic Savio', 'St. Aloysius Gonzaga', 'All of the above'], ans: 3 },
  { q: 'What is the Paschal Mystery?', opts: ['The birth of Jesus', 'The passion, death, resurrection, and ascension of Jesus', 'The institution of the Eucharist', 'The creation of the world'], ans: 1 },
  { q: 'How many commandments are in the Beatitudes?', opts: ['7', '8', '10', '12'], ans: 1 },
  { q: 'What is the name of the Gospel writer who was a physician?', opts: ['Matthew', 'Mark', 'Luke', 'John'], ans: 2 },
  { q: 'Which saint received the stigmata?', opts: ['St. Dominic', 'St. Francis of Assisi', 'St. Anthony', 'St. Thomas Aquinas'], ans: 1 },
  { q: 'What does "Incarnation" mean?', opts: ['God becoming man in Jesus Christ', 'The resurrection', 'The ascension', 'The creation'], ans: 0 },
  { q: 'How many corporal works of mercy are there?', opts: ['5', '7', '9', '10'], ans: 1 },
  { q: 'What is the Sign of the Cross?', opts: ['A prayer', 'A blessing invoking the Trinity', 'A hymn', 'A sacrament'], ans: 1 },
  { q: 'Who wrote the Acts of the Apostles?', opts: ['Luke', 'Paul', 'Peter', 'Mark'], ans: 0 },
  { q: 'What is a novena?', opts: ['A 9-day prayer', 'A type of mass', 'A feast day', 'A pilgrimage'], ans: 0 },
  { q: 'Which angel announced the birth of Jesus to Mary?', opts: ['Raphael', 'Michael', 'Gabriel', 'Uriel'], ans: 2 },
  { q: 'What is the purpose of Confirmation?', opts: ['Forgiveness of sins', 'Strength of the Holy Spirit', 'Marriage preparation', 'Holy Orders'], ans: 1 },
  { q: 'Who are the four evangelists?', opts: ['Peter, Paul, James, John', 'Matthew, Mark, Luke, John', 'Matthew, Mark, Luke, Paul', 'Mark, Luke, John, Peter'], ans: 1 },
  { q: 'Which Old Testament figure parted the Red Sea?', opts: ['Abraham', 'Moses', 'Joshua', 'David'], ans: 1 },
  { q: 'What is the Assumption?', opts: ['Mary taken body and soul into heaven', 'Jesus\' ascension', 'Mary\'s birth', 'The resurrection of the dead'], ans: 0 },
  { q: 'How many days of Easter are in the Octave?', opts: ['7', '8', '10', '14'], ans: 1 },
  { q: 'Which pope convened the Second Vatican Council?', opts: ['Pope John XXIII', 'Pope Paul VI', 'Pope Pius XII', 'Pope John Paul II'], ans: 0 },
  { q: 'What is a scapular?', opts: ['A vestment', 'A sacramental worn by the faithful', 'A type of prayer', 'A liturgical book'], ans: 1 },
  { q: 'Which book follows the Gospels in the New Testament?', opts: ['Romans', 'Acts of the Apostles', 'Revelation', 'Ephesians'], ans: 1 },
  { q: 'What is the first day of Advent?', opts: ['December 25', 'The fourth Sunday before Christmas', 'November 1', 'December 1'], ans: 1 },
  { q: 'Who is the patron saint of musicians?', opts: ['St. Cecilia', 'St. Gregory', 'St. Augustine', 'St. Ambrose'], ans: 0 },
  { q: 'What is the Great Commandment?', opts: ['Love God and love your neighbor', 'Honor your parents', 'Keep the Sabbath', 'Do not kill'], ans: 0 },
  { q: 'Which saint wrote "The Confessions"?', opts: ['St. Jerome', 'St. Augustine', 'St. Thomas Aquinas', 'St. Athanasius'], ans: 1 },
  { q: 'How many times did Peter forgive according to Jesus?', opts: ['7 times', '70 times 7', '3 times', 'Never'], ans: 1 },
  { q: 'What is the sanctuary?', opts: ['The church entrance', 'The area around the altar', 'The baptismal font', 'The confession room'], ans: 1 },
  { q: 'Which prophet was swallowed by a whale?', opts: ['Elijah', 'Jonah', 'Isaiah', 'Jeremiah'], ans: 1 },
  { q: 'What happened on Ascension Thursday?', opts: ['Jesus rose from the dead', 'Jesus ascended into heaven', 'Holy Spirit descended', 'Jesus was born'], ans: 1 },
  { q: 'How many loaves were used in the feeding of the 4,000?', opts: ['5', '7', '3', '6'], ans: 1 },
  { q: 'Which saint is known as the "Angelic Doctor"?', opts: ['St. Augustine', 'St. Thomas Aquinas', 'St. Jerome', 'St. Anselm'], ans: 1 },
  { q: 'What is the purpose of the Sacrament of Reconciliation?', opts: ['Healing of the sick', 'Forgiveness of sins', 'Marriage blessing', 'Baptism preparation'], ans: 1 },
  { q: 'How many chapters are in the Book of Psalms?', opts: ['100', '150', '175', '200'], ans: 1 },
  { q: 'What are the names of Jesus\' earthly parents?', opts: ['Joseph and Mary', 'Joachim and Anne', 'Zechariah and Elizabeth', 'Joseph and Anne'], ans: 0 },
  { q: 'Which pope was the first from outside Europe in over 1,200 years?', opts: ['Pope Francis', 'Pope John Paul II', 'Pope Benedict XVI', 'Pope Paul VI'], ans: 0 },
  { q: 'What is a basilica?', opts: ['A parish church', 'A church with special privileges from the Pope', 'A monastery', 'A cathedral'], ans: 1 },
  { q: 'Who is the patron saint of youth?', opts: ['St. Aloysius Gonzaga', 'St. John Bosco', 'St. Dominic Savio', 'All of the above'], ans: 3 },
  { q: 'What is the central act of Catholic worship?', opts: ['Bible study', 'The Eucharist / Mass', 'Prayer group', 'Rosary'], ans: 1 },
  { q: 'Which book of the Bible contains the Ten Commandments?', opts: ['Genesis', 'Exodus', 'Leviticus', 'Numbers'], ans: 1 },
  { q: 'What are the three sacraments of Christian initiation?', opts: ['Baptism, Confirmation, Eucharist', 'Baptism, Reconciliation, Matrimony', 'Confirmation, Holy Orders, Anointing', 'Eucharist, Matrimony, Holy Orders'], ans: 0 },
  { q: 'What are the Four Marks of the Church?', opts: ['One, Holy, Catholic, Apostolic', 'Faith, Hope, Love, Charity', 'Peace, Justice, Mercy, Grace', 'Roman, Latin, Eastern, Universal'], ans: 0 },
  { q: 'What does "Catholic" mean?', opts: ['Holy', 'Universal', 'Faithful', 'Ancient'], ans: 1 },
  { q: 'Who is the head of the Catholic Church?', opts: ['The Pope', 'The Archbishop', 'The Cardinal', 'The Bishop'], ans: 0 },
  { q: 'What is the first encyclical of Pope Francis called?', opts: ['Laudato Si\'', 'Lumen Fidei', 'Evangelii Gaudium', 'Fratelli Tutti'], ans: 2 },
  { q: 'What are the two sources of Divine Revelation?', opts: ['Scripture and Tradition', 'Scripture and Reason', 'Tradition and Science', 'Faith and Works'], ans: 0 },
  { q: 'What is the "Deposit of Faith"?', opts: ['The Church\'s treasury', 'Scripture and Tradition together', 'The Vatican archives', 'The Apostles\' Creed'], ans: 1 },
  { q: 'Which council defined the doctrine of the Trinity?', opts: ['Council of Trent', 'Council of Nicaea', 'Vatican II', 'Council of Ephesus'], ans: 1 },
  { q: 'What are the sacraments of healing?', opts: ['Baptism and Confirmation', 'Reconciliation and Anointing of the Sick', 'Eucharist and Matrimony', 'Holy Orders and Baptism'], ans: 1 },
  { q: 'What are the sacraments of service and vocation?', opts: ['Baptism and Confirmation', 'Eucharist and Reconciliation', 'Holy Orders and Matrimony', 'Anointing and Baptism'], ans: 2 },
  { q: 'What is the matter of the Sacrament of Baptism?', opts: ['Oil', 'Water', 'Bread', 'Wine'], ans: 1 },
  { q: 'What is the form of the Sacrament of Baptism?', opts: ['The Lord\'s Prayer', 'The words "I baptize you in the name of the Father, and of the Son, and of the Holy Spirit"', 'The Sign of the Cross', 'The Creed'], ans: 1 },
  { q: 'Who can validly baptize in an emergency?', opts: ['Only a priest', 'Only a deacon', 'Only a bishop', 'Any person with the proper intention'], ans: 3 },
  { q: 'What does "Ex opere operato" mean?', opts: ['The sacrament works by the very fact of being performed', 'Faith alone saves', 'Works are necessary', 'The priest\'s holiness matters'], ans: 0 },
  { q: 'What are the three degrees of Holy Orders?', opts: ['Deacon, Priest, Bishop', 'Priest, Bishop, Cardinal', 'Deacon, Priest, Pope', 'Bishop, Archbishop, Cardinal'], ans: 0 },
  { q: 'What is apostolic succession?', opts: ['The line of bishops tracing back to the apostles', 'The succession of Popes', 'The order of Mass', 'The succession of Gospels'], ans: 0 },
  { q: 'What is Papal Infallibility?', opts: ['The Pope can never sin', 'The Pope is preserved from error when defining doctrine ex cathedra', 'The Pope knows everything', 'The Pope has all power in the Church'], ans: 1 },
  { q: 'How many precepts of the Church are there?', opts: ['3', '5', '7', '10'], ans: 1 },
  { q: 'What is the first precept of the Church?', opts: ['Attend Mass on Sundays and holy days', 'Confess sins once a year', 'Receive Eucharist at Easter', 'Fast on prescribed days'], ans: 0 },
  { q: 'What is the Communion of Saints?', opts: ['A gathering of saints in heaven', 'The spiritual union of all the faithful, living and dead', 'The sacrament of the Eucharist', 'A prayer group'], ans: 1 },
  { q: 'What is Purgatory?', opts: ['A place of eternal punishment', 'A state of purification after death', 'A place of rest before heaven', 'The Limbo of the Fathers'], ans: 1 },
  { q: 'What are the three conditions for a mortal sin?', opts: ['Grave matter, full knowledge, deliberate consent', 'Bad thought, bad word, bad deed', 'Pride, greed, lust', 'Thought, word, omission'], ans: 0 },
  { q: 'What are the seven capital sins?', opts: ['Pride, greed, lust, envy, gluttony, wrath, sloth', 'Faith, hope, charity, prudence, justice, fortitude, temperance', 'Murder, theft, adultery, lying, coveting, blasphemy, disobedience', 'Anger, jealousy, hatred, fear, doubt, despair, apathy'], ans: 0 },
  { q: 'What are the spiritual works of mercy?', opts: ['Feed the hungry, give drink to the thirsty, shelter the homeless', 'Counsel the doubtful, instruct the ignorant, admonish the sinner', 'Visit the sick, bury the dead, give alms', 'Pray, fast, give alms'], ans: 1 },
  { q: 'What are the three evangelical counsels?', opts: ['Poverty, chastity, obedience', 'Faith, hope, charity', 'Prudence, justice, fortitude', 'Prayer, fasting, almsgiving'], ans: 0 },
  { q: 'What is the Angelus?', opts: ['A prayer to the Holy Spirit', 'A Marian prayer recalling the Annunciation', 'A morning offering', 'A prayer for the dead'], ans: 1 },
  { q: 'What is the Divine Mercy Chaplet?', opts: ['A devotion based on St. Faustina\'s vision of Jesus', 'A prayer to St. Michael', 'A type of Rosary', 'A Stations of the Cross devotion'], ans: 0 },
  { q: 'What is Eucharistic Adoration?', opts: ['The worship of the Eucharist outside of Mass', 'The reception of Holy Communion', 'A type of Mass', 'A Bible study'], ans: 0 },
  { q: 'What are the four parts of the Mass?', opts: ['Introduction, Liturgy of the Word, Liturgy of the Eucharist, Conclusion', 'Introit, Kyrie, Gloria, Creed', 'Liturgy of the Word, Offertory, Canon, Communion', 'Opening Rites, Liturgy of the Word, Liturgy of the Eucharist, Concluding Rites'], ans: 3 },
  { q: 'What is the Liturgy of the Word?', opts: ['The reading of Scripture and homily', 'The Eucharistic Prayer', 'The consecration of bread and wine', 'The final blessing'], ans: 0 },
  { q: 'What is the Liturgy of the Eucharist?', opts: ['The Gospel reading', 'The homily', 'The presentation of gifts, Eucharistic prayer, and Communion', 'The opening hymn'], ans: 2 },
  { q: 'What is the "Holy Day of Obligation"?', opts: ['A day when Catholics must attend Mass', 'A feast day of a saint', 'A day of fasting', 'A day for confession'], ans: 0 },
  { q: 'Which of these is a Holy Day of Obligation in the United States?', opts: ['St. Patrick\'s Day', 'Immaculate Conception (Dec 8)', 'St. Valentine\'s Day', 'Palm Sunday'], ans: 1 },
  { q: 'What is the Easter Triduum?', opts: ['The three days before Easter', 'Holy Thursday, Good Friday, Holy Saturday', 'Easter Sunday and the following two days', 'The 40 days of Lent'], ans: 1 },
  { q: 'What is celebrated on Holy Thursday?', opts: ['The crucifixion', 'The institution of the Eucharist and the Priesthood', 'The resurrection', 'The ascension'], ans: 1 },
  { q: 'What is celebrated on Good Friday?', opts: ['The institution of the Eucharist', 'The passion and death of Jesus', 'The resurrection', 'The descent of the Holy Spirit'], ans: 1 },
  { q: 'What is the Easter Vigil?', opts: ['A service on Holy Saturday night celebrating the Resurrection', 'A morning Mass on Easter', 'A Good Friday service', 'A Saturday evening Mass'], ans: 0 },
  { q: 'What is Ordinary Time in the liturgical calendar?', opts: ['The time outside of Advent, Christmas, Lent, and Easter', 'The weekdays of Lent', 'The period after Easter', 'The month of November'], ans: 0 },
  { q: 'What is Corpus Christi?', opts: ['The feast of the Body and Blood of Christ', 'The feast of Christ the King', 'The feast of the Sacred Heart', 'The feast of the Cross'], ans: 0 },
  { q: 'What is the Feast of the Immaculate Conception?', opts: ['The conception of Jesus', 'Mary conceived without original sin', 'The birth of Mary', 'The assumption of Mary'], ans: 1 },
  { q: 'What is All Saints Day?', opts: ['November 1, honoring all saints', 'November 2, praying for the dead', 'December 8, honoring Mary', 'August 15, honoring Mary'], ans: 0 },
  { q: 'What is All Souls Day?', opts: ['November 1, honoring all saints', 'November 2, praying for the faithful departed', 'December 8, honoring Mary', 'August 15, honoring Mary'], ans: 1 },
  { q: 'What is the Feast of Christ the King?', opts: ['The last Sunday of Ordinary Time', 'The first Sunday of Advent', 'Easter Sunday', 'Christmas Day'], ans: 0 },
  { q: 'Which saint is the patron of the universal Church?', opts: ['St. Peter', 'St. Joseph', 'St. Michael', 'St. Paul'], ans: 1 },
  { q: 'Who was St. John Bosco?', opts: ['A bishop who wrote the Summa', 'A priest who founded the Salesians and worked with youth', 'A Franciscan missionary', 'A Benedictine monk'], ans: 1 },
  { q: 'Which saint wrote the Summa Theologica?', opts: ['St. Augustine', 'St. Thomas Aquinas', 'St. Jerome', 'St. Anselm'], ans: 1 },
  { q: 'Who founded the Franciscan order?', opts: ['St. Dominic', 'St. Francis of Assisi', 'St. Benedict', 'St. Ignatius of Loyola'], ans: 1 },
  { q: 'Who founded the Dominican order?', opts: ['St. Francis of Assisi', 'St. Dominic', 'St. Benedict', 'St. Ignatius of Loyola'], ans: 1 },
  { q: 'Who founded the Society of Jesus (Jesuits)?', opts: ['St. Francis of Assisi', 'St. Dominic', 'St. Benedict', 'St. Ignatius of Loyola'], ans: 3 },
  { q: 'What is the charism of the Salesians?', opts: ['Work and prayer', 'Preaching and teaching', 'Working with youth and education', 'Contemplation and solitude'], ans: 2 },
  { q: 'Who was St. Monica?', opts: ['A virgin martyr', 'The mother of St. Augustine, known for her persistent prayer', 'A nun who founded a convent', 'A wife of a Roman emperor'], ans: 1 },
  { q: 'Which saint is known as the "Father of the Church" in the West?', opts: ['St. Jerome', 'St. Augustine', 'St. Ambrose', 'St. Gregory the Great'], ans: 1 },
  { q: 'Who was St. Lorenzo Ruiz?', opts: ['A Spanish missionary', 'The first Filipino saint, a martyr', 'An Italian priest', 'A Mexican martyr'], ans: 1 },
  { q: 'What is the main difference between the Catholic Bible and Protestant Bibles?', opts: ['The Catholic Bible includes the Deuterocanonical books', 'The Catholic Bible has more Gospels', 'The Catholic Bible is in Latin', 'There is no difference'], ans: 0 },
  { q: 'How many deuterocanonical books are in the Catholic Bible?', opts: ['3', '5', '7', '10'], ans: 2 },
  { q: 'Which book of the Bible is primarily about the wisdom of God?', opts: ['Proverbs', 'Wisdom', 'Sirach', 'All of the above are wisdom books'], ans: 3 },
  { q: 'What is the Vulgate?', opts: ['An English translation of the Bible', 'The Latin translation of the Bible by St. Jerome', 'A Greek translation of the Old Testament', 'A commentary on the Bible'], ans: 1 },
  { q: 'What is the Septuagint?', opts: ['The Latin translation of the Bible', 'The Greek translation of the Old Testament', 'The Hebrew Bible', 'The Aramaic Targum'], ans: 1 },
  { q: 'How many chapters are in the Book of Genesis?', opts: ['40', '50', '60', '75'], ans: 1 },
  { q: 'Who are the four major prophets?', opts: ['Hosea, Joel, Amos, Obadiah', 'Isaiah, Jeremiah, Ezekiel, Daniel', 'Isaiah, Jeremiah, Lamentations, Baruch', 'Daniel, Hosea, Jonah, Micah'], ans: 1 },
  { q: 'Who are the 12 minor prophets?', opts: ['The last 12 books of the Old Testament', '12 disciples who became prophets', '12 prophets who wrote shorter books', 'The sons of Jacob'], ans: 2 },
  { q: 'Which prophet foretold the virgin birth of the Messiah?', opts: ['Jeremiah', 'Isaiah', 'Ezekiel', 'Micah'], ans: 1 },
  { q: 'What is the "Protoevangelium" (first Gospel)?', opts: ['The beginning of Mark', 'Genesis 3:15, the first promise of a Redeemer', 'The prologue of John', 'Isaiah\'s prophecy'], ans: 1 },
  { q: 'What is the Gospel of Matthew primarily about?', opts: ['Jesus as the fulfillment of Old Testament prophecies', 'Jesus as the suffering servant', 'Jesus as the Son of Man', 'Jesus as the divine Word'], ans: 0 },
  { q: 'What is the Gospel of Luke primarily about?', opts: ['Jesus as the fulfillment of prophecy', 'Jesus as the compassionate Savior for all people', 'Jesus as the suffering servant', 'Jesus as the divine Word'], ans: 1 },
  { q: 'What is the Gospel of John primarily about?', opts: ['Jesus as the fulfillment of prophecy', 'Jesus as the compassionate healer', 'Jesus as the divine Son of God', 'Jesus as the teacher of parables'], ans: 2 },
  { q: 'What are the Pauline epistles?', opts: ['Letters written by St. Peter', 'Letters written by St. Paul to churches and individuals', 'Letters written by St. John', 'Letters written by St. James'], ans: 1 },
  { q: 'How many epistles did St. Paul write?', opts: ['7', '10', '13', '21'], ans: 2 },
  { q: 'Which epistle speaks most about love?', opts: ['Romans', '1 Corinthians 13', 'Ephesians', 'Galatians'], ans: 1 },
  { q: 'What is the great commission?', opts: ['Jesus\' command to go and make disciples of all nations', 'The Ten Commandments', 'The Beatitudes', 'The Golden Rule'], ans: 0 },
  { q: 'What happened at the Council of Jerusalem?', opts: ['The Apostles decided Gentile converts did not need to follow all Jewish laws', 'The Nicene Creed was written', 'The canon of Scripture was decided', 'Peter was named Pope'], ans: 0 },
  { q: 'Who is the patron saint of your parish, St. Monica?', opts: ['The mother of St. Augustine', 'A virgin martyr', 'A Roman empress', 'A Franciscan nun'], ans: 0 },
  { q: 'What is St. Monica known for?', opts: ['Her preaching', 'Her persistent prayer for the conversion of her son', 'Her miracles', 'Her writings'], ans: 1 },
  { q: 'In which city did St. Monica pray for her son\'s conversion?', opts: ['Rome', 'Milan', 'Hippo', 'Tagaste'], ans: 3 },
  { q: 'What is a catechumen?', opts: ['A baptized Catholic', 'A person preparing for Baptism', 'A newly ordained priest', 'A religious sister'], ans: 1 },
  { q: 'What is the Rite of Christian Initiation of Adults (RCIA)?', opts: ['A program for adult converts to enter the Church', 'A Bible study group', 'A prayer group for mothers', 'A youth group meeting'], ans: 0 },
  { q: 'What is a diocese?', opts: ['A single parish', 'A territory of churches under a bishop', 'A religious order', 'A Vatican office'], ans: 1 },
  { q: 'What is a parish?', opts: ['A diocese', 'A local community of the faithful under a pastor', 'A religious order', 'A shrine'], ans: 1 },
  { q: 'What is a bishop\'s primary role?', opts: ['To govern a religious order', 'To be the shepherd of a diocese with the fullness of Holy Orders', 'To assist the Pope in Rome', 'To teach at a seminary'], ans: 1 },
  { q: 'What is a monsignor?', opts: ['A bishop', 'An honorary title for a priest', 'A deacon', 'A cardinal'], ans: 1 },
  { q: 'What is a cardinal\'s primary role?', opts: ['To govern a diocese', 'To elect the Pope and advise him', 'To lead a religious order', 'To act as a missionary'], ans: 1 },
  { q: 'What is the Roman Curia?', opts: ['The Pope\'s residence', 'The administrative body of the Holy See', 'The College of Cardinals', 'The Vatican Museums'], ans: 1 },
  { q: 'What is a synod?', opts: ['A type of Mass', 'A gathering of bishops to discuss Church matters', 'A liturgical season', 'A prayer service'], ans: 1 },
  { q: 'What was the Second Vatican Council?', opts: ['A council that defined the Trinity', 'An ecumenical council of the Catholic Church from 1962-1965', 'A council that condemned heresies', 'A local synod'], ans: 1 },
  { q: 'What is the Basilica of St. Peter?', opts: ['A church in Assisi', 'The principal church of the Vatican, built over St. Peter\'s tomb', 'A cathedral in Rome', 'A monastery'], ans: 1 },
  { q: 'What is the Vatican?', opts: ['A city in Italy', 'The spiritual and administrative center of the Catholic Church', 'A church in Rome', 'A university'], ans: 1 },
  { q: 'What is a pilgrimage?', opts: ['A vacation', 'A journey to a holy place for spiritual reasons', 'A Church procession', 'A retreat'], ans: 1 },
  { q: 'What are the major pilgrimage sites of the Church?', opts: ['Rome, Assisi, Lourdes', 'Jerusalem, Rome, Santiago de Compostela', 'Paris, London, New York', 'Fatima, Lourdes, Knock'], ans: 1 },
  { q: 'What is a relic?', opts: ['A historical artifact', 'A physical object associated with a saint', 'A type of prayer', 'A liturgical book'], ans: 1 },
  { q: 'What is a first-class relic?', opts: ['An item owned by a saint', 'The body or part of the body of a saint', 'An item blessed by a saint', 'A piece of the True Cross'], ans: 1 },
  { q: 'What is a consecrated virgin?', opts: ['A nun', 'A woman consecrated to God while living in the world', 'A married woman', 'A widow'], ans: 1 },
  { q: 'What is a religious order?', opts: ['A group of laity', 'A community of consecrated life following a specific charism and rule', 'A diocese', 'A parish council'], ans: 1 },
  { q: 'What are the three types of religious vows?', opts: ['Poverty, chastity, obedience', 'Faith, hope, charity', 'Prayer, fasting, almsgiving', 'Silence, solitude, service'], ans: 0 },
  { q: 'What is the difference between a priest and a deacon?', opts: ['A deacon cannot celebrate Mass or hear confessions', 'A deacon can only preach', 'A deacon is not ordained', 'There is no difference'], ans: 0 },
  { q: 'What is the pallium?', opts: ['A vestment worn by the Pope and archbishops', 'A type of altar cloth', 'A chalice veil', 'A bishop\'s ring'], ans: 0 },
  { q: 'What is a cathedral?', opts: ['Any large church', 'The principal church of a diocese where the bishop\'s cathedra (chair) is', 'A monastery church', 'A parish church'], ans: 1 },
  { q: 'What is the Chair of Peter?', opts: ['A physical chair in St. Peter\'s Basilica', 'The authority and office of the Pope as successor of Peter', 'A throne in the Vatican', 'A symbol of episcopal authority'], ans: 1 },
  { q: 'What is the laity?', opts: ['Bishops', 'All baptized faithful who are not clergy or consecrated religious', 'Priests', 'Deacons'], ans: 1 },
  { q: 'What is natural law?', opts: ['The law of nature', 'The moral law written on every human heart by God', 'The civil law', 'The Old Testament law'], ans: 1 },
  { q: 'What is the principle of double effect?', opts: ['A moral principle that allows good even if a bad effect follows, if the good is intended', 'A teaching about two natures of Christ', 'A principle of just war', 'A teaching about the Trinity'], ans: 0 },
  { q: 'What is a just war?', opts: ['A war that is easy to win', 'A war that meets strict moral criteria to be considered morally permissible', 'A war against non-believers', 'A defensive war only'], ans: 1 },
  { q: 'What is the Church\'s teaching on the death penalty?', opts: ['It is always required', 'It is inadmissible because the dignity of the person is not lost even after grave crimes', 'It is always optional', 'It is required for murder'], ans: 1 },
  { q: 'What is the social teaching of the Church called?', opts: ['Catholic Social Doctrine', 'Political Theology', 'Social Gospel', 'Liberation Theology'], ans: 0 },
  { q: 'What are the seven themes of Catholic Social Teaching?', opts: ['Life and dignity, family, rights, work, solidarity, poor, care for creation', 'Faith, hope, charity, prudence, justice, fortitude, temperance', 'Prayer, fasting, almsgiving, study, work, rest, worship', 'Baptism, confirmation, eucharist, penance, anointing, holy orders, matrimony'], ans: 0 },
  { q: 'What is subsidiarity?', opts: ['Giving to the Church', 'Matters should be handled at the most local level possible', 'The Pope has all authority', 'The state is supreme'], ans: 1 },
  { q: 'What is solidarity?', opts: ['Being alone in prayer', 'The virtue of standing with others, recognizing we are one human family', 'A type of penance', 'A form of worship'], ans: 1 },
  { q: 'What is the common good?', opts: ['What is good for an individual', 'The sum total of social conditions that allow people to reach their fulfillment', 'The good of the Church only', 'Material prosperity'], ans: 1 },
  { q: 'What is the preferential option for the poor?', opts: ['Giving preferential treatment to the rich', 'A fundamental principle requiring care for the most vulnerable', 'A type of charity event', 'A government program'], ans: 1 },
  { q: 'What are indulgences?', opts: ['Permission to sin', 'Remission of temporal punishment due to sin already forgiven', 'A type of blessing', 'A Church tax'], ans: 1 },
  { q: 'What are the conditions for a plenary indulgence?', opts: ['Sacramental confession, Eucharistic communion, prayer for Pope\'s intentions, detachment from all sin', 'Just attending Mass', 'Just saying a prayer', 'Just giving to charity'], ans: 0 },
  { q: 'What is the "Smell of the Sheep" concept from Pope Francis?', opts: ['A farm metaphor', 'Shepherds should be close to their people, sharing their joys and struggles', 'A teaching about animals', 'A hygiene rule for clergy'], ans: 1 },
  { q: 'What is St. Monica\'s feast day?', opts: ['August 28', 'August 27', 'August 15', 'August 20'], ans: 1 },
  { q: 'What is St. Augustine\'s feast day?', opts: ['August 28', 'August 27', 'August 15', 'August 20'], ans: 0 },
  { q: 'Which saint is known as the "Apostle to the Gentiles"?', opts: ['St. Peter', 'St. Paul', 'St. Barnabas', 'St. Timothy'], ans: 1 },
  { q: 'What is the "Dark Night of the Soul"?', opts: ['A sleep disorder', 'A spiritual purification described by St. John of the Cross', 'A type of depression', 'A sin of despair'], ans: 1 },
  { q: 'What is the "Interior Castle"?', opts: ['A medieval fortress', 'A book by St. Teresa of Avila about spiritual growth', 'A Vatican building', 'A type of meditation'], ans: 1 },
  { q: 'What is the "Spiritual Exercises"?', opts: ['A workout routine', 'A retreat guide by St. Ignatius of Loyola', 'A prayer book', 'A seminary textbook'], ans: 1 },
  { q: 'What is the "Our Father"?', opts: ['A prayer to Mary', 'The prayer Jesus taught his disciples', 'A psalm', 'A creed'], ans: 1 },
  { q: 'What is the "Hail Mary"?', opts: ['A prayer composed of the words of Gabriel and Elizabeth, asking Mary to pray for us', 'A greeting to Mary', 'A hymn to Mary', 'A Gospel reading about Mary'], ans: 0 },
  { q: 'What is the "Glory Be"?', opts: ['A hymn to Jesus', 'A doxology praising the Trinity', 'A psalm of David', 'A prayer to the Holy Spirit'], ans: 1 },
  { q: 'What is a litany?', opts: ['A short prayer', 'A form of prayer with repeated invocations and responses', 'A song of praise', 'A Scripture reading'], ans: 1 },
  { q: 'What is the Litany of the Saints?', opts: ['A prayer invoking the intercession of all saints', 'A list of canonized saints', 'A feast day celebration', 'A Mass reading'], ans: 0 },
  { q: 'What is the TLM abbreviation for?', opts: ['The Latin Mass', 'Traditional Latin Mass', 'The Liturgy of the Mass', 'Three Letter Mass'], ans: 1 },
  { q: 'What is the Novus Ordo?', opts: ['The Order of Preachers', 'The Mass celebrated according to the reformed liturgy after Vatican II', 'A new religious order', 'A type of prayer'], ans: 1 },
  { q: 'What is a tabernacle?', opts: ['A tent in the Old Testament', 'The place in church where the Eucharist is reserved', 'A type of altar', 'A reliquary'], ans: 1 },
  { q: 'What is a ciborium?', opts: ['A vessel containing the consecrated hosts for Communion', 'A chalice', 'A type of monstrance', 'An altar cloth'], ans: 0 },
  { q: 'What is a thurible?', opts: ['A candle holder', 'A vessel for burning incense', 'A bell rung at Mass', 'A processional cross'], ans: 1 },
  { q: 'What is the sanctuary lamp?', opts: ['A lamp in the church entrance', 'A candle that burns near the tabernacle to indicate Christ\'s presence', 'A light at the altar', 'A votive candle stand'], ans: 1 },
  { q: 'What is the "Paschal Candle"?', opts: ['A candle used at every Mass', 'The large candle blessed at the Easter Vigil representing Christ as the light', 'A candle for Advent', 'A candle for baptisms'], ans: 1 },
  { q: 'What is the "Gloria" in the Mass?', opts: ['A hymn of praise to God', 'A prayer of confession', 'A reading from the Gospel', 'A blessing'], ans: 0 },
  { q: 'What is the "Creed" in the Mass?', opts: ['A song', 'A profession of faith', 'A reading', 'A prayer of intercession'], ans: 1 },
  { q: 'What is the "Sanctus"?', opts: ['A prayer before Communion', '"Holy, Holy, Holy" — a hymn of praise before the Eucharistic Prayer', 'A reading from the prophet Isaiah', 'A blessing of the congregation'], ans: 1 },
  { q: 'What is the "Consecration"?', opts: ['The moment when the bread and wine become the Body and Blood of Christ', 'The opening prayer', 'The final blessing', 'The Gospel reading'], ans: 0 },
  { q: 'What is the "Fraction Rite"?', opts: ['The breaking of the bread before Communion', 'The division of the congregation', 'A liturgical book', 'A type of chant'], ans: 0 },
  { q: 'What is the "Kiss of Peace"?', opts: ['A greeting exchanged during Mass as a sign of unity', 'A kiss on the Pope\'s ring', 'A wedding tradition', 'A blessing of couples'], ans: 0 },
  { q: 'What is "ad orientem" worship?', opts: ['Praying facing east', 'The priest facing the same direction as the people (toward the altar)', 'The priest facing the people', 'A type of procession'], ans: 1 },
  { q: 'What is "versus populum" worship?', opts: ['The priest facing the people during Mass', 'The priest facing the altar', 'A type of chant', 'A liturgical reform'], ans: 0 },
  { q: 'What is Gregorian chant?', opts: ['A modern style of church music', 'The traditional liturgical chant of the Roman Church', 'A type of polyphony', 'A folk hymn style'], ans: 1 },
  { q: 'What is the organ\'s role in the Catholic Church?', opts: ['It is the only instrument allowed at Mass', 'It is the traditional instrument for liturgical music', 'It is forbidden at Mass', 'It is optional'], ans: 1 },
  { q: 'What are the eight Beatitudes from the Sermon on the Mount?', opts: ['Blessings pronounced by Jesus on those who embody the Kingdom', 'The Ten Commandments', 'The seven gifts of the Holy Spirit', 'The fruits of the Holy Spirit'], ans: 0 },
  { q: 'What is the Golden Rule?', opts: ['Do unto others as you would have them do unto you', 'Love the Lord your God', 'Keep the Sabbath holy', 'Honor your father and mother'], ans: 0 },
  { q: 'What is the Parable of the Prodigal Son about?', opts: ['A wasteful farmer', 'God\'s merciful love and forgiveness for repentant sinners', 'A rich man and a poor man', 'A lost sheep'], ans: 1 },
  { q: 'What is the Parable of the Good Samaritan about?', opts: ['A kind traveler', 'The duty to show mercy to all, even enemies', 'A story about priests and Levites', 'A journey to Jerusalem'], ans: 1 },
  { q: 'What is "exorcism"?', opts: ['A blessing of a house', 'The rite of driving out demons by the power of Christ and his Church', 'A type of prayer', 'A healing Mass'], ans: 1 },
  { q: 'What is the role of a pastor in a parish?', opts: ['To manage the finances', 'To be the spiritual shepherd of the parish entrusted to his care', 'To coordinate events', 'To lead Bible studies only'], ans: 1 },
];

const STORAGE_KEY = 'triviaUsedQuestions';

function getUsedQuestions() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; }
  catch { return []; }
}
function saveUsedQuestions(indices) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(indices));
}

let usedVerses = [];
let askedQuestions = [];
let currentScore = 0;
let currentQIdx = 0;
let totalQuestions = 10;
let gameActive = false;
let canAnswer = false;

function pickRandom(arr, used) {
  const pool = arr.filter((_, i) => !used.includes(i));
  if (pool.length === 0) used.length = 0;
  const idx = arr.indexOf(pool[Math.floor(Math.random() * pool.length)]);
  used.push(idx);
  return arr[idx];
}

function initBibleIntro() {
  const intro = document.querySelector('[data-bible-intro]');
  const bg = document.querySelector('.bible-intro-bg');
  const perspective = document.querySelector('[data-book-perspective]');
  const cross = document.querySelector('[data-cover-cross]');
  const letters = document.querySelectorAll('[data-bt-l]');
  const rays = document.querySelectorAll('.sun-ray');
  const glow = document.querySelector('[data-book-glow]');

  gsap.set(intro, { autoAlpha: 1, pointerEvents: 'all' });
  gsap.set(bg, { opacity: 0 });
  gsap.set(perspective, { scale: 0.5, opacity: 0 });
  gsap.set(glow, { opacity: 0, scale: 0.3 });
  gsap.set(rays, { opacity: 0, scaleY: 0, transformOrigin: 'center top' });

  letters.forEach(l => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 200;
    gsap.set(l, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rotation: (Math.random() - 0.5) * 720,
      opacity: 0,
    });
  });

  gsap.set(cross, { x: 0, y: -250, rotation: 180, opacity: 0, scale: 0.3 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to(bg, { opacity: 1, duration: 0.6 })
    .to(perspective, { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.4)' }, '-=0.3')
    .to(cross, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.7)' }, '-=0.2')
    .to(letters, {
      x: 0, y: 0, rotation: 0, opacity: 1,
      duration: 0.8, stagger: 0.06, ease: 'back.out(1.4)',
    }, '-=0.4')
    .to(glow, { opacity: 0.7, scale: 1.2, duration: 0.6 }, '-=0.2')
    .to(rays, { opacity: 0.8, scaleY: 1, duration: 0.8, stagger: 0.02, ease: 'power2.out' }, '-=0.4')
    .to(rays, { opacity: 0, duration: 0.6, stagger: 0.03 }, '-=0.2')
    .to(glow, { opacity: 0, scale: 1.8, duration: 0.8, ease: 'power2.in' }, '-=0.3');

  return tl;
}

function showVerseOfDay() {
  const overlay = document.querySelector('[data-verse-overlay]');
  const modal = document.querySelector('[data-verse-modal]');
  const textEl = document.querySelector('[data-verse-text]');
  const refEl = document.querySelector('[data-verse-ref]');
  const closeBtn = document.querySelector('[data-verse-close]');

  const verse = pickRandom(VERSES, usedVerses);
  textEl.textContent = `"${verse.text}"`;
  refEl.textContent = `— ${verse.ref}`;

  gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
  gsap.set(modal, { scale: 0.8, opacity: 0, y: 30 });

  gsap.to(overlay, { autoAlpha: 1, pointerEvents: 'all', duration: 0.6, ease: 'power2.out' });
  gsap.to(modal, { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)', delay: 0.3 });

  return new Promise(resolve => {
    closeBtn.addEventListener('click', () => {
      gsap.to(modal, { scale: 0.8, opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' });
      gsap.to(overlay, { autoAlpha: 0, pointerEvents: 'none', duration: 0.3, delay: 0.1, onComplete: resolve });
    });
  });
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startTrivia() {
  if (gameActive) return;
  gameActive = true;
  currentScore = 0;
  currentQIdx = 0;

  const used = getUsedQuestions();
  const available = QUESTIONS.map((_, i) => i).filter(i => !used.includes(i));
  if (available.length < totalQuestions) {
    saveUsedQuestions([]);
    const indices = shuffleArray(Array.from({ length: QUESTIONS.length }, (_, i) => i));
    askedQuestions = indices.slice(0, totalQuestions);
  } else {
    const shuffled = shuffleArray([...available]);
    askedQuestions = shuffled.slice(0, totalQuestions);
    saveUsedQuestions([...used, ...askedQuestions]);
  }

  const startEl = document.querySelector('[data-trivia-start]');
  const card = document.querySelector('[data-question-card]');
  const stats = document.querySelector('[data-trivia-stats]');

  gsap.to(startEl, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in', onComplete: () => { startEl.style.display = 'none'; } });

  gsap.set([card, stats], { display: 'block' });
  gsap.fromTo(stats, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  gsap.fromTo(card, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 });

  updateProgress();
  showQuestion();
}

function updateProgress() {
  const fill = document.querySelector('[data-trivia-progress-fill]');
  const text = document.querySelector('[data-trivia-progress-text]');
  const pct = totalQuestions > 0 ? ((currentQIdx) / totalQuestions) * 100 : 0;
  gsap.to(fill, { width: `${pct}%`, duration: 0.5, ease: 'power2.out' });
  text.textContent = `${currentQIdx} / ${totalQuestions}`;
}

function showQuestion() {
  if (currentQIdx >= totalQuestions) {
    endTrivia();
    return;
  }

  canAnswer = true;
  const qIdx = askedQuestions[currentQIdx];
  const qData = QUESTIONS[qIdx];

  const numEl = document.querySelector('[data-q-number]');
  const textEl = document.querySelector('[data-q-text]');
  const optsEl = document.querySelector('[data-q-options]');
  const feedbackEl = document.querySelector('[data-q-feedback]');

  numEl.textContent = `Question ${currentQIdx + 1}`;
  textEl.textContent = qData.q;
  feedbackEl.textContent = '';
  feedbackEl.className = 'trivia-feedback';

  optsEl.innerHTML = '';
  qData.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'trivia-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(i));
    optsEl.appendChild(btn);
  });

  gsap.fromTo(numEl, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
  gsap.fromTo(textEl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 });
  gsap.fromTo(optsEl.children, { opacity: 0, y: 20, scale: 0.95 }, {
    opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)', stagger: 0.07, delay: 0.2,
  });
}

function handleAnswer(idx) {
  if (!canAnswer) return;
  canAnswer = false;

  const qIdx = askedQuestions[currentQIdx];
  const qData = QUESTIONS[qIdx];
  const isCorrect = idx === qData.ans;
  const options = document.querySelectorAll('[data-q-options] .trivia-option');
  const feedbackEl = document.querySelector('[data-q-feedback]');

  options.forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (i === qData.ans) btn.classList.add('correct');
    else if (i === idx && !isCorrect) btn.classList.add('wrong');
  });

  if (isCorrect) {
    currentScore += 10;
    document.querySelector('[data-trivia-score]').textContent = currentScore;
    feedbackEl.textContent = 'Correct! +10 points';
    feedbackEl.classList.add('is-correct');
    gsap.fromTo(feedbackEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  } else {
    feedbackEl.textContent = `Incorrect. The answer was: ${qData.opts[qData.ans]}`;
    feedbackEl.classList.add('is-wrong');
    gsap.fromTo(feedbackEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  }

  setTimeout(() => {
    currentQIdx++;
    updateProgress();
    gsap.to(document.querySelector('[data-question-card]'), {
      opacity: 0, y: -20, duration: 0.25, ease: 'power2.in', onComplete: () => {
        document.querySelector('[data-question-card]').style.opacity = '1';
        document.querySelector('[data-question-card]').style.transform = 'none';
        showQuestion();
      },
    });
  }, 1200);
}

function endTrivia() {
  gameActive = false;
  const card = document.querySelector('[data-question-card]');
  const stats = document.querySelector('[data-trivia-stats]');
  const startEl = document.querySelector('[data-trivia-start]');

  gsap.to(stats, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' });
  gsap.to(card, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in', delay: 0.1, onComplete: () => {
    const maxScore = totalQuestions * 10;
    const pct = Math.round((currentScore / maxScore) * 100);
    let grade = '';
    if (pct >= 90) grade = 'Outstanding! You are a Scripture scholar!';
    else if (pct >= 70) grade = 'Great job! You know your faith well!';
    else if (pct >= 50) grade = 'Good effort! Keep studying the Word.';
    else grade = 'Keep reading! The Bible is full of treasures.';

    card.innerHTML = `
      <div class="trivia-result" data-trivia-result>
        <div class="trivia-result-icon">✝</div>
        <h2 class="trivia-result-title">Quiz Complete!</h2>
        <div class="trivia-result-score">${currentScore} / ${maxScore}</div>
        <div class="trivia-result-pct">${pct}%</div>
        <p class="trivia-result-grade">${grade}</p>
        <button class="button button-gold button-lg" data-trivia-restart>Play Again</button>
      </div>
    `;

    gsap.set(card, { opacity: 1, y: 0 });

    const result = document.querySelector('[data-trivia-result]');
    gsap.fromTo(result, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.fromTo(card.querySelector('.trivia-result-icon'), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.2 });
    gsap.fromTo(card.querySelector('.trivia-result-title'), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.3 });
    gsap.fromTo(card.querySelector('.trivia-result-score'), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', delay: 0.4 });
    gsap.fromTo(card.querySelector('.trivia-result-pct'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.5 });
    gsap.fromTo(card.querySelector('.trivia-result-grade'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.6 });
    gsap.fromTo(card.querySelector('[data-trivia-restart]'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.7 });

    document.querySelector('[data-trivia-restart]').addEventListener('click', () => {
      card.innerHTML = '<div class="trivia-q-number" data-q-number></div><p class="trivia-q-text" data-q-text></p><div class="trivia-options" data-q-options></div><div class="trivia-feedback" data-q-feedback></div>';
      stats.style.display = '';
      startEl.style.display = '';
      gsap.set(startEl, { opacity: 0 });
      startTrivia();
    });

    stats.style.display = 'none';
  } });
}

function initSectionHeaders() {
  document.querySelectorAll('[data-split-lines]').forEach(el => {
    gsap.fromTo(el, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 40%', toggleActions: 'play none none none' },
    });
  });

  document.querySelectorAll('[data-section-header]').forEach(el => {
    const tag = el.querySelector('.section-tag');
    const divider = el.querySelector('.section-divider');
    const desc = el.querySelector('.section-desc');
    if (tag) gsap.fromTo(tag, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' } });
    if (divider) gsap.fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play none none none' } });
    if (desc) gsap.fromTo(desc, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none none' }, delay: 0.2 });
  });
}

function initHeroAnim() {
  const badge = document.querySelector('[data-trivia-badge]');
  const sub = document.querySelector('[data-trivia-sub]');
  if (badge) gsap.fromTo(badge, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 });
  if (sub) gsap.fromTo(sub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
}

async function init() {
  const { lenis } = initLenis();
  initInertia();
  initNavbar();
  await initLoader();

  setTimeout(() => { document.documentElement.classList.add('fonts-loaded'); }, 100);

  const tl = initBibleIntro();
  const intro = document.querySelector('[data-bible-intro]');

  await new Promise(resolve => {
    gsap.delayedCall(tl.totalDuration() + 0.6, async () => {
      await showVerseOfDay();
      gsap.to(intro, { autoAlpha: 0, pointerEvents: 'none', duration: 0.5, ease: 'power2.in' });
      resolve();
    });
  });

  initSectionHeaders();
  initHeroAnim();

  document.querySelector('[data-trivia-btn]').addEventListener('click', startTrivia);

  ScrollTrigger.refresh();
  lenis.emit('scroll');
}

document.addEventListener('DOMContentLoaded', init);

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء عملية زرع البيانات...');

  // إنشاء كلمات مرور مشفرة
  const adminPassword = await hash('admin123', 10);
  const studentPassword = await hash('student123', 10);

  // إنشاء حساب المدير
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'د. أحمد محمد السيد',
      role: "ADMIN",
      isActive: true,
    },
  });

  // إنشاء حساب طالب للاختبار
  const student1 = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      password: studentPassword,
      name: 'عمر أحمد الرشيد',
      role: "STUDENT",
      universityId: 'ST001',
      isActive: true,
    },
  });

  // إنشاء المزيد من الطلاب
  const additionalStudents = [
    {
      email: 'sara@example.com',
      name: 'سارة محمد إبراهيم',
      universityId: 'ST002',
    },
    {
      email: 'hassan@example.com',
      name: 'حسن علي النجار',
      universityId: 'ST003',
    },
    {
      email: 'fatima@example.com',
      name: 'فاطمة أحمد المطيري',
      universityId: 'ST004',
    },
    {
      email: 'khalid@example.com',
      name: 'خالد عبدالله الزهراني',
      universityId: 'ST005',
    },
  ];

  const createdStudents = [];
  for (const studentData of additionalStudents) {
    const student = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        email: studentData.email,
        password: studentPassword,
        name: studentData.name,
        role: "STUDENT",
        universityId: studentData.universityId,
        isActive: true,
      },
    });
    createdStudents.push(student);
  }

  // إنشاء طلاب مسجلين مسبقاً
  const preRegisteredStudents = [
    { fullName: 'عبدالرحمن سعد القحطاني', universityId: 'ST006', isUsed: false },
    { fullName: 'نورا فهد الدوسري', universityId: 'ST007', isUsed: false },
    { fullName: 'محمد عبدالعزيز الشهري', universityId: 'ST008', isUsed: false },
    { fullName: 'أميرة سلطان الغامدي', universityId: 'ST009', isUsed: false },
    { fullName: 'يوسف ناصر الحربي', universityId: 'ST010', isUsed: false },
    { fullName: 'ريم عبدالله الصالح', universityId: 'ST011', isUsed: false },
    { fullName: 'طارق محمد الفيصل', universityId: 'ST012', isUsed: false },
    { fullName: 'هند سعود العتيبي', universityId: 'ST013', isUsed: false },
    { fullName: 'سلطان أحمد الرشيد', universityId: 'ST014', isUsed: false },
    { fullName: 'لينا خالد المالكي', universityId: 'ST015', isUsed: false },
  ];

  for (const preStudent of preRegisteredStudents) {
    await prisma.preRegisteredStudent.upsert({
      where: { universityId: preStudent.universityId },
      update: {},
      create: preStudent,
    });
  }

  // إنشاء المستويات الدراسية
  const levels = [
    { name: 'المستوى الأول', description: 'المستوى التأسيسي للطلاب الجدد', order: 1 },
    { name: 'المستوى الثاني', description: 'المستوى المتوسط للطلاب', order: 2 },
    { name: 'المستوى الثالث', description: 'المستوى المتقدم للطلاب', order: 3 },
    { name: 'المستوى الرابع', description: 'المستوى النهائي والتخصصي', order: 4 },
  ];

  const createdLevels = [];
  for (const levelData of levels) {
    const level = await prisma.level.upsert({
      where: { order: levelData.order },
      update: {},
      create: {
        name: levelData.name,
        description: levelData.description,
        order: levelData.order,
        isVisible: true,
      },
    });
    createdLevels.push(level);
  }

  // إنشاء المقررات الدراسية
  const courses = [
    // مقررات المستوى الأول
    { name: 'مقدمة في علوم الحاسوب', description: 'مقرر تأسيسي يغطي المفاهيم الأساسية لعلوم الحاسوب', levelId: createdLevels[0].id },
    { name: 'الرياضيات الأساسية', description: 'المفاهيم الأساسية في الرياضيات والجبر', levelId: createdLevels[0].id },
    { name: 'اللغة الإنجليزية التقنية', description: 'تطوير مهارات اللغة الإنجليزية للمجال التقني', levelId: createdLevels[0].id },
    { name: 'مهارات الحاسوب', description: 'المهارات الأساسية لاستخدام الحاسوب والإنترنت', levelId: createdLevels[0].id },
    
    // مقررات المستوى الثاني
    { name: 'البرمجة باستخدام Python', description: 'تعلم أساسيات البرمجة باستخدام لغة Python', levelId: createdLevels[1].id },
    { name: 'هياكل البيانات', description: 'دراسة هياكل البيانات المختلفة وتطبيقاتها', levelId: createdLevels[1].id },
    { name: 'قواعد البيانات', description: 'أساسيات قواعد البيانات وتصميم النظم', levelId: createdLevels[1].id },
    { name: 'الشبكات والاتصالات', description: 'مبادئ الشبكات والاتصالات الحاسوبية', levelId: createdLevels[1].id },
    
    // مقررات المستوى الثالث
    { name: 'البرمجة المتقدمة', description: 'تقنيات البرمجة المتقدمة والتطوير', levelId: createdLevels[2].id },
    { name: 'الذكاء الاصطناعي', description: 'مقدمة في الذكاء الاصطناعي وتطبيقاته', levelId: createdLevels[2].id },
    { name: 'تطوير الويب', description: 'تطوير مواقع الويب باستخدام التقنيات الحديثة', levelId: createdLevels[2].id },
    { name: 'أمن المعلومات', description: 'أساسيات أمن المعلومات والحماية السيبرانية', levelId: createdLevels[2].id },
    
    // مقررات المستوى الرابع
    { name: 'مشروع التخرج', description: 'مشروع تطبيقي شامل للتخرج', levelId: createdLevels[3].id },
    { name: 'الحوسبة السحابية', description: 'تقنيات الحوسبة السحابية والتطبيقات', levelId: createdLevels[3].id },
    { name: 'إدارة المشاريع التقنية', description: 'مبادئ إدارة المشاريع في المجال التقني', levelId: createdLevels[3].id },
    { name: 'ريادة الأعمال التقنية', description: 'تطوير المهارات الريادية في المجال التقني', levelId: createdLevels[3].id },
  ];

  const createdCourses = [];
  for (let i = 0; i < courses.length; i++) {
    const course = await prisma.course.upsert({
      where: { id: `course-${i + 1}` },
      update: {},
      create: {
        id: `course-${i + 1}`,
        name: courses[i].name,
        description: courses[i].description,
        levelId: courses[i].levelId,
        isVisible: true,
      },
    });
    createdCourses.push(course);
  }

  // إنشاء مجموعات البطاقات التعليمية
  const flashcardDecks = [
    { name: 'مفاهيم أساسية في البرمجة', description: 'المفاهيم الأساسية التي يجب على كل مبرمج معرفتها', courseId: createdCourses[0].id },
    { name: 'مصطلحات قواعد البيانات', description: 'المصطلحات الأساسية في قواعد البيانات', courseId: createdCourses[6].id },
    { name: 'أساسيات الشبكات', description: 'المفاهيم الأساسية في الشبكات', courseId: createdCourses[7].id },
    { name: 'مصطلحات الذكاء الاصطناعي', description: 'المصطلحات الأساسية في الذكاء الاصطناعي', courseId: createdCourses[9].id },
  ];

  const createdDecks = [];
  for (let i = 0; i < flashcardDecks.length; i++) {
    const deck = await prisma.flashcardDeck.upsert({
      where: { id: `deck-${i + 1}` },
      update: {},
      create: {
        id: `deck-${i + 1}`,
        name: flashcardDecks[i].name,
        description: flashcardDecks[i].description,
        courseId: flashcardDecks[i].courseId,
        isVisible: true,
      },
    });
    createdDecks.push(deck);
  }

  // إنشاء البطاقات التعليمية
  const flashcards = [
    // مفاهيم أساسية في البرمجة
    { question: 'ما هي المتغيرات في البرمجة؟', answer: 'المتغيرات هي مساحات في الذاكرة تستخدم لتخزين البيانات والقيم', deckId: createdDecks[0].id, order: 1 },
    { question: 'ما هي الدالة في البرمجة؟', answer: 'الدالة هي مجموعة من الأوامر التي تؤدي مهمة معينة ويمكن استدعاؤها عند الحاجة', deckId: createdDecks[0].id, order: 2 },
    { question: 'ما هي الحلقة التكرارية؟', answer: 'الحلقة التكرارية هي بنية تسمح بتكرار مجموعة من الأوامر عدة مرات', deckId: createdDecks[0].id, order: 3 },
    { question: 'ما هو الشرط في البرمجة؟', answer: 'الشرط هو عبارة منطقية تُستخدم لاتخاذ قرارات في البرنامج', deckId: createdDecks[0].id, order: 4 },
    
    // مصطلحات قواعد البيانات
    { question: 'ما هي قاعدة البيانات؟', answer: 'قاعدة البيانات هي مجموعة منظمة من البيانات المترابطة والمُخزنة إلكترونياً', deckId: createdDecks[1].id, order: 1 },
    { question: 'ما هو الجدول في قواعد البيانات؟', answer: 'الجدول هو مجموعة من الصفوف والأعمدة تحتوي على البيانات', deckId: createdDecks[1].id, order: 2 },
    { question: 'ما هو المفتاح الأساسي؟', answer: 'المفتاح الأساسي هو حقل أو مجموعة حقول تحدد كل سجل في الجدول بشكل فريد', deckId: createdDecks[1].id, order: 3 },
    
    // أساسيات الشبكات
    { question: 'ما هي الشبكة؟', answer: 'الشبكة هي مجموعة من الأجهزة المترابطة التي تستطيع التواصل فيما بينها', deckId: createdDecks[2].id, order: 1 },
    { question: 'ما هو عنوان IP؟', answer: 'عنوان IP هو عنوان رقمي فريد يُستخدم لتحديد الأجهزة على الشبكة', deckId: createdDecks[2].id, order: 2 },
    { question: 'ما هو البروتوكول؟', answer: 'البروتوكول هو مجموعة من القواعد التي تحدد كيفية تبادل البيانات بين الأجهزة', deckId: createdDecks[2].id, order: 3 },
  ];

  for (const card of flashcards) {
    await prisma.flashcard.upsert({
      where: { id: `card-${card.deckId}-${card.order}` },
      update: {},
      create: {
        id: `card-${card.deckId}-${card.order}`,
        question: card.question,
        answer: card.answer,
        deckId: card.deckId,
        order: card.order,
      },
    });
  }

  // إنشاء الاختبارات
  const quizzes = [
    { title: 'اختبار مفاهيم البرمجة الأساسية', description: 'اختبار تقييمي لمفاهيم البرمجة الأساسية', courseId: createdCourses[0].id },
    { title: 'اختبار قواعد البيانات', description: 'اختبار شامل لمفاهيم قواعد البيانات', courseId: createdCourses[6].id },
    { title: 'اختبار الشبكات', description: 'اختبار تقييمي لمفاهيم الشبكات', courseId: createdCourses[7].id },
    { title: 'اختبار الذكاء الاصطناعي', description: 'اختبار تقييمي لمفاهيم الذكاء الاصطناعي', courseId: createdCourses[9].id },
  ];

  const createdQuizzes = [];
  for (let i = 0; i < quizzes.length; i++) {
    const quiz = await prisma.quiz.upsert({
      where: { id: `quiz-${i + 1}` },
      update: {},
      create: {
        id: `quiz-${i + 1}`,
        title: quizzes[i].title,
        description: quizzes[i].description,
        courseId: quizzes[i].courseId,
        isVisible: true,
      },
    });
    createdQuizzes.push(quiz);
  }

  // إنشاء أسئلة الاختبارات
  const questions = [
    // أسئلة اختبار البرمجة
    { text: 'ما هي لغة البرمجة؟', explanation: 'لغة البرمجة هي مجموعة من الرموز والقواعد المُستخدمة لكتابة البرامج', quizId: createdQuizzes[0].id, order: 1 },
    { text: 'ما هو الكومبايلر؟', explanation: 'الكومبايلر هو برنامج يترجم الكود المكتوب بلغة البرمجة إلى لغة الآلة', quizId: createdQuizzes[0].id, order: 2 },
    { text: 'ما هو الخطأ المنطقي؟', explanation: 'الخطأ المنطقي هو خطأ في منطق البرنامج يؤدي لنتائج غير صحيحة', quizId: createdQuizzes[0].id, order: 3 },
    
    // أسئلة اختبار قواعد البيانات
    { text: 'ما هو SQL؟', explanation: 'SQL هي لغة استعلام منظمة تُستخدم للتعامل مع قواعد البيانات', quizId: createdQuizzes[1].id, order: 1 },
    { text: 'ما هو الاستعلام؟', explanation: 'الاستعلام هو طلب للحصول على بيانات معينة من قاعدة البيانات', quizId: createdQuizzes[1].id, order: 2 },
  ];

  const createdQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    const question = await prisma.question.upsert({
      where: { id: `question-${i + 1}` },
      update: {},
      create: {
        id: `question-${i + 1}`,
        text: questions[i].text,
        explanation: questions[i].explanation,
        quizId: questions[i].quizId,
        order: questions[i].order,
      },
    });
    createdQuestions.push(question);
  }

  // إنشاء إجابات الأسئلة
  const answers = [
    // إجابات السؤال الأول
    { text: 'مجموعة من الأوامر والرموز', questionId: createdQuestions[0].id, isCorrect: true, order: 1 },
    { text: 'نوع من أنواع الأجهزة', questionId: createdQuestions[0].id, isCorrect: false, order: 2 },
    { text: 'برنامج كمبيوتر', questionId: createdQuestions[0].id, isCorrect: false, order: 3 },
    { text: 'نظام تشغيل', questionId: createdQuestions[0].id, isCorrect: false, order: 4 },
    
    // إجابات السؤال الثاني
    { text: 'محرر نصوص', questionId: createdQuestions[1].id, isCorrect: false, order: 1 },
    { text: 'مترجم البرنامج', questionId: createdQuestions[1].id, isCorrect: true, order: 2 },
    { text: 'نظام قاعدة البيانات', questionId: createdQuestions[1].id, isCorrect: false, order: 3 },
    { text: 'متصفح الإنترنت', questionId: createdQuestions[1].id, isCorrect: false, order: 4 },
  ];

  for (let i = 0; i < answers.length; i++) {
    await prisma.answer.upsert({
      where: { id: `answer-${i + 1}` },
      update: {},
      create: {
        id: `answer-${i + 1}`,
        text: answers[i].text,
        questionId: answers[i].questionId,
        isCorrect: answers[i].isCorrect,
        order: answers[i].order,
      },
    });
  }

  // إنشاء مواد الدرجات
  const gpaSubjects = [
    { yearName: 'السنة الأولى', subjectName: 'مقدمة في علوم الحاسوب', creditHours: 3, order: 1 },
    { yearName: 'السنة الأولى', subjectName: 'الرياضيات الأساسية', creditHours: 4, order: 2 },
    { yearName: 'السنة الأولى', subjectName: 'اللغة الإنجليزية التقنية', creditHours: 2, order: 3 },
    { yearName: 'السنة الأولى', subjectName: 'مهارات الحاسوب', creditHours: 2, order: 4 },
    { yearName: 'السنة الثانية', subjectName: 'البرمجة باستخدام Python', creditHours: 4, order: 5 },
    { yearName: 'السنة الثانية', subjectName: 'هياكل البيانات', creditHours: 3, order: 6 },
    { yearName: 'السنة الثانية', subjectName: 'قواعد البيانات', creditHours: 3, order: 7 },
    { yearName: 'السنة الثانية', subjectName: 'الشبكات والاتصالات', creditHours: 3, order: 8 },
    { yearName: 'السنة الثالثة', subjectName: 'البرمجة المتقدمة', creditHours: 4, order: 9 },
    { yearName: 'السنة الثالثة', subjectName: 'الذكاء الاصطناعي', creditHours: 3, order: 10 },
    { yearName: 'السنة الثالثة', subjectName: 'تطوير الويب', creditHours: 4, order: 11 },
    { yearName: 'السنة الثالثة', subjectName: 'أمن المعلومات', creditHours: 3, order: 12 },
    { yearName: 'السنة الرابعة', subjectName: 'مشروع التخرج', creditHours: 6, order: 13 },
    { yearName: 'السنة الرابعة', subjectName: 'الحوسبة السحابية', creditHours: 3, order: 14 },
    { yearName: 'السنة الرابعة', subjectName: 'إدارة المشاريع التقنية', creditHours: 2, order: 15 },
  ];

  for (const subject of gpaSubjects) {
    await prisma.gpaSubject.upsert({
      where: { order: subject.order },
      update: {},
      create: subject,
    });
  }

  // إنشاء فئات المنتجات
  const productCategories = [
    { name: 'الكتب الأكاديمية', description: 'الكتب الدراسية والمراجع الأكاديمية' },
    { name: 'الأدوات المكتبية', description: 'الأدوات والمستلزمات المكتبية للطلاب' },
    { name: 'الإلكترونيات', description: 'الأجهزة والمعدات الإلكترونية' },
    { name: 'الملابس الجامعية', description: 'الملابس والإكسسوارات الجامعية' },
  ];

  const createdCategories = [];
  for (let i = 0; i < productCategories.length; i++) {
    const category = await prisma.productCategory.upsert({
      where: { id: `category-${i + 1}` },
      update: {},
      create: {
        id: `category-${i + 1}`,
        name: productCategories[i].name,
        description: productCategories[i].description,
        isVisible: true,
      },
    });
    createdCategories.push(category);
  }

  // إنشاء المنتجات
  const products = [
    // كتب أكاديمية
    { name: 'كتاب أساسيات البرمجة', slug: 'programming-basics-book', description: 'كتاب شامل لتعلم أساسيات البرمجة', price: 85.0, categoryId: createdCategories[0].id, isSpecialOffer: true },
    { name: 'دليل قواعد البيانات', slug: 'database-guide', description: 'دليل متكامل لتعلم قواعد البيانات', price: 95.0, categoryId: createdCategories[0].id, isSpecialOffer: false },
    { name: 'مرجع الشبكات', slug: 'networks-reference', description: 'مرجع شامل لمفاهيم الشبكات', price: 120.0, categoryId: createdCategories[0].id, isSpecialOffer: false },
    
    // أدوات مكتبية
    { name: 'حقيبة طالب', slug: 'student-bag', description: 'حقيبة عملية للطلاب', price: 45.0, categoryId: createdCategories[1].id, isSpecialOffer: false },
    { name: 'دفتر ملاحظات', slug: 'notebook', description: 'دفتر ملاحظات عالي الجودة', price: 15.0, categoryId: createdCategories[1].id, isSpecialOffer: true },
    { name: 'أقلام متنوعة', slug: 'pens-set', description: 'مجموعة من الأقلام المتنوعة', price: 25.0, categoryId: createdCategories[1].id, isSpecialOffer: false },
    
    // إلكترونيات
    { name: 'فأرة لاسلكية', slug: 'wireless-mouse', description: 'فأرة لاسلكية عالية الدقة', price: 35.0, categoryId: createdCategories[2].id, isSpecialOffer: false },
    { name: 'لوحة مفاتيح', slug: 'keyboard', description: 'لوحة مفاتيح مريحة للكتابة', price: 65.0, categoryId: createdCategories[2].id, isSpecialOffer: true },
    { name: 'سماعات رأس', slug: 'headphones', description: 'سماعات رأس عالية الجودة', price: 80.0, categoryId: createdCategories[2].id, isSpecialOffer: false },
    
    // ملابس جامعية
    { name: 'قميص جامعي', slug: 'university-shirt', description: 'قميص بشعار الجامعة', price: 40.0, categoryId: createdCategories[3].id, isSpecialOffer: false },
    { name: 'كوب قهوة جامعي', slug: 'university-mug', description: 'كوب قهوة بشعار الجامعة', price: 20.0, categoryId: createdCategories[3].id, isSpecialOffer: true },
  ];

  for (let i = 0; i < products.length; i++) {
    await prisma.product.upsert({
      where: { slug: products[i].slug },
      update: {},
      create: {
        name: products[i].name,
        slug: products[i].slug,
        description: products[i].description,
        price: products[i].price,
        categoryId: products[i].categoryId,
        isVisible: true,
        isSpecialOffer: products[i].isSpecialOffer,
      },
    });
  }

  // إنشاء الكتب
  const books = [
    { title: 'مقدمة في خوارزميات الحاسوب', slug: 'computer-algorithms-intro', author: 'د. محمد أحمد الخوارزمي', description: 'كتاب شامل عن خوارزميات الحاسوب وتطبيقاتها', totalCopies: 10, availableCopies: 8 },
    { title: 'أساسيات البرمجة الشيئية', slug: 'oop-basics', author: 'د. فاطمة سعد النجار', description: 'دليل تعلم البرمجة الشيئية بأسلوب مبسط', totalCopies: 15, availableCopies: 12 },
    { title: 'تطوير تطبيقات الهاتف المحمول', slug: 'mobile-app-development', author: 'م. عبدالله محمد الرشيد', description: 'دليل شامل لتطوير تطبيقات الهاتف المحمول', totalCopies: 8, availableCopies: 6 },
    { title: 'أمن الشبكات والمعلومات', slug: 'network-security', author: 'د. سارة أحمد القحطاني', description: 'مفاهيم أمن الشبكات وحماية المعلومات', totalCopies: 12, availableCopies: 10 },
    { title: 'تحليل البيانات الضخمة', slug: 'big-data-analysis', author: 'د. خالد سلطان الغامدي', description: 'مقدمة في تحليل البيانات الضخمة', totalCopies: 6, availableCopies: 4 },
    { title: 'الذكاء الاصطناعي التطبيقي', slug: 'applied-ai', author: 'د. نورا عبدالعزيز المطيري', description: 'تطبيقات الذكاء الاصطناعي في الحياة العملية', totalCopies: 14, availableCopies: 11 },
    { title: 'تطوير المواقع الإلكترونية', slug: 'web-development', author: 'م. يوسف ناصر الشهري', description: 'دليل شامل لتطوير المواقع الإلكترونية', totalCopies: 20, availableCopies: 18 },
    { title: 'إدارة قواعد البيانات', slug: 'database-management', author: 'د. أميرة فهد الدوسري', description: 'مفاهيم وتطبيقات إدارة قواعد البيانات', totalCopies: 16, availableCopies: 13 },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { slug: book.slug },
      update: {},
      create: {
        title: book.title,
        slug: book.slug,
        author: book.author,
        description: book.description,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        isVisible: true,
      },
    });
  }

  // إنشاء بعض طلبات الكتب والمنتجات كأمثلة
  const createdBooks = await prisma.book.findMany();
  const createdProducts = await prisma.product.findMany();

  // طلبات الكتب
  await prisma.bookOrder.create({
    data: {
      studentId: student1.id,
      bookId: createdBooks[0].id,
      status: 'PENDING',
      studentNotes: 'أحتاج هذا الكتاب لمقرر الخوارزميات',
    },
  });

  await prisma.bookOrder.create({
    data: {
      studentId: createdStudents[0].id,
      bookId: createdBooks[1].id,
      status: 'APPROVED',
      adminNotes: 'تم الموافقة على الطلب',
    },
  });

  // طلبات المنتجات
  const order1 = await prisma.order.create({
    data: {
      studentId: student1.id,
      total: 110.0,
      status: 'PENDING',
      studentNotes: 'أحتاج هذه المنتجات للفصل الدراسي الجديد',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: createdProducts[0].id, quantity: 1, price: 85.0 },
      { orderId: order1.id, productId: createdProducts[4].id, quantity: 1, price: 15.0 },
      { orderId: order1.id, productId: createdProducts[10].id, quantity: 1, price: 20.0 },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      studentId: createdStudents[1].id,
      total: 45.0,
      status: 'COMPLETED',
      adminNotes: 'تم تسليم الطلب بنجاح',
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: createdProducts[3].id,
      quantity: 1,
      price: 45.0,
    },
  });

  console.log('✅ تمت عملية زرع البيانات بنجاح!');
  console.log('📊 إحصائيات البيانات المُضافة:');
  console.log(`👤 حساب المدير: ${admin.email} (كلمة المرور: admin123)`);
  console.log(`🎓 حساب الطالب: ${student1.email} (كلمة المرور: student123)`);
  console.log(`📚 عدد المستويات: ${levels.length}`);
  console.log(`📖 عدد المقررات: ${courses.length}`);
  console.log(`🃏 عدد مجموعات البطاقات: ${flashcardDecks.length}`);
  console.log(`❓ عدد الاختبارات: ${quizzes.length}`);
  console.log(`📚 عدد الكتب: ${books.length}`);
  console.log(`🛒 عدد المنتجات: ${products.length}`);
  console.log(`👥 عدد الطلاب المسجلين مسبقاً: ${preRegisteredStudents.length}`);
  console.log(`🎯 عدد مواد الدرجات: ${gpaSubjects.length}`);
  
  console.log('\n🔑 بيانات الاختبار:');
  console.log('المدير: admin@example.com / admin123');
  console.log('الطالب: student@example.com / student123');
  console.log('طلاب إضافيون: sara@example.com, hassan@example.com, fatima@example.com, khalid@example.com');
  console.log('كلمة المرور لجميع الطلاب: student123');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في زرع البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
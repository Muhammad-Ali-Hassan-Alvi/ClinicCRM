const mockDelay = (ms) => new Promise(res => setTimeout(res, ms));

export const getSummary = async (text) => {
  await mockDelay(1500);
  if (!text || text.trim().length === 0) {
    return "There is no text to summarize.";
  }
  const summary = `This is a mock summary of the provided text. The conversation appears to be about scheduling or a customer inquiry. Key points have been extracted and condensed for quick review. The overall sentiment seems to be neutral.`;
  return summary;
};

export const getTranslation = async (text, targetLang) => {
  await mockDelay(1000);
  if (!text || text.trim().length === 0) {
    return "No text to translate.";
  }
  if (targetLang === 'ar') {
    return `(ترجمة تجريبية) ${text}`;
  }
  return `(Mock Translation) ${text}`;
};

export const getReplySuggestion = async (history) => {
  await mockDelay(1200);
  return [
    "Thank you for contacting us. How can I help you today?",
    "We have received your message and will get back to you shortly.",
    "Could you please provide more details about your inquiry?",
  ];
};

export const getAnswerFromKB = async (question, knowledgeBaseFiles) => {
  await mockDelay(2000);
  const aiFiles = (knowledgeBaseFiles || []).filter(f => f.aiEnabled);

  if (aiFiles.length === 0) {
    return "I'm here to help! However, our AI knowledge base is currently being updated. Please feel free to ask your question and one of our team members will assist you shortly.";
  }

  const q = question.toLowerCase();
  
  // Price-related queries
  if (q.includes("price") || q.includes("cost") || q.includes("fee") || q.includes("charge")) {
    const priceFile = aiFiles.find(doc => doc.category === 'Price List');
    if (priceFile) {
      return `I can help you with pricing information! Based on our current price list "${priceFile.title}", we offer various services. Could you please specify which treatment or service you're interested in? This will help me provide you with accurate pricing details.`;
    }
  }
  
  // Morpheus8 specific queries
  if (q.includes("morpheus")) {
    const procedureFile = aiFiles.find(doc => 
      doc.category === 'Procedures' && 
      (doc.title.toLowerCase().includes('morpheus') || doc.description.toLowerCase().includes('morpheus'))
    );
    if (procedureFile) {
      return `Great question about Morpheus8! According to our treatment guide "${procedureFile.title}", Morpheus8 is an advanced fractional radiofrequency microneedling treatment that remodels and contours the face and body. It's excellent for skin tightening, reducing wrinkles, and improving skin texture. Would you like to know more about the procedure, pricing, or schedule a consultation?`;
    }
  }

  // Procedure-related queries
  if (q.includes("treatment") || q.includes("procedure") || q.includes("service")) {
    const procedureFile = aiFiles.find(doc => doc.category === 'Procedures');
    if (procedureFile) {
      return `I'd be happy to help you learn about our treatments! We offer a comprehensive range of procedures detailed in our guide "${procedureFile.title}". What specific treatment are you interested in? I can provide information about the procedure, benefits, and next steps.`;
    }
  }

  // FAQ queries
  if (q.includes("faq") || q.includes("question") || q.includes("how") || q.includes("what") || q.includes("when")) {
    const faqFile = aiFiles.find(doc => doc.category === 'FAQs');
    if (faqFile) {
      return `I can help answer your question! Based on our FAQ document "${faqFile.title}", we cover topics like appointment booking, preparation instructions, aftercare, and policies. What would you like to know more about?`;
    }
  }

  // Appointment/booking queries
  if (q.includes("appointment") || q.includes("book") || q.includes("schedule") || q.includes("available")) {
    return `I'd be happy to help you schedule an appointment! To book your consultation or treatment, please let me know:
1. Which service you're interested in
2. Your preferred date/time
3. Any specific concerns or questions you have

Our team will get back to you shortly to confirm your appointment details.`;
  }

  // Promotion queries
  if (q.includes("offer") || q.includes("discount") || q.includes("promotion") || q.includes("special")) {
    const promoFile = aiFiles.find(doc => doc.category === 'Promotions');
    if (promoFile) {
      return `Great timing! We currently have special offers available. Based on our promotions document "${promoFile.title}", we have various packages and discounts. Would you like me to share details about our current promotions that might interest you?`;
    }
  }

  // General consultation
  if (q.includes("consultation") || q.includes("consult")) {
    return `Absolutely! We offer comprehensive consultations to discuss your goals and recommend the best treatment plan for you. During your consultation, our specialists will:
- Assess your skin/concerns
- Explain suitable treatment options
- Provide detailed pricing
- Answer all your questions

Would you like to schedule a consultation? Please let me know your availability.`;
  }

  // Default response with knowledge base context
  const categories = [...new Set(aiFiles.map(f => f.category))];
  return `Thank you for your message! I have access to information about ${categories.join(', ')} to help answer your questions. Could you please provide more details about what you're looking for? This will help me give you the most accurate and helpful information.`;
};
'use client';
import { FormEvent, useState } from 'react';
import formData from '../form.json';

type Question = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
  options?: string[];
  otherOption?: boolean;
  conditionalOn?: {
    questionId: string;
    value: string;
  };
};

type Section = {
  sectionTitle: string;
  sectionDescription?: string;
  questions: Question[];
};

function flattenQuestions(sections: Section[]): Question[] {
  return sections.flatMap((section) => section.questions);
}

export default function RSVPPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const allQuestions = flattenQuestions(formData.sections as Section[]);

  const currentQuestion = allQuestions[currentQuestionIndex];

  function shouldShowQuestion(question: Question): boolean {
    if (!question.conditionalOn) return true;
    const dependentValue = answers[question.conditionalOn.questionId];
    return dependentValue === question.conditionalOn.value;
  }

  function getVisibleQuestions(): Question[] {
    return allQuestions.filter((q) => shouldShowQuestion(q));
  }

  const visibleQuestions = getVisibleQuestions();
  const visibleCurrentQuestion = visibleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  function handleAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (
      visibleCurrentQuestion?.required &&
      !answers[visibleCurrentQuestion.id]
    ) {
      setErrorMsg('This field is required.');
      return;
    }
    setErrorMsg('');
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }

  function handleBack() {
    setErrorMsg('');
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }

  function handleSubmitForm() {
    console.log('Submitting:', answers);
    setStatus('success');
  }

  async function handleRSVP(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please fill in your name and email.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/openhouse-rsvp', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || 'Something went wrong. Please try again.',
        );
      }

      setStatus('success');
    } catch (err: any) {
      if (err && 'message' in err) {
        setErrorMsg(err.message);
        setStatus('error');
      }
    }
  }

  function renderQuestionInput(question: Question) {
    const value = answers[question.id] || '';

    switch (question.type) {
      case 'email':
        return (
          <input
            className="rsvp-input"
            type="email"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your email"
          />
        );
      case 'text':
        return (
          <input
            className="rsvp-input"
            type="text"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your answer"
          />
        );
      case 'dropdown':
        return (
          <select
            className="rsvp-input"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          >
            <option value="">Select an option</option>
            {question.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case 'multipleChoice':
        return (
          <div className="form-options">
            {question.options?.map((opt) => (
              <label key={opt} className="form-option-label">
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                />
                <span className="option-text">{opt}</span>
              </label>
            ))}
            {question.otherOption && (
              <label className="form-option-label">
                <input
                  type="radio"
                  name={question.id}
                  value="Other"
                  checked={value === 'Other'}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                />
                <span className="option-text">Other</span>
                {value === 'Other' && (
                  <input
                    className="rsvp-input other-input"
                    type="text"
                    placeholder="Please specify"
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                  />
                )}
              </label>
            )}
          </div>
        );
      case 'multipleTickbox':
        const currentValues = (value as string[]) || [];
        const handleCheckbox = (opt: string) => {
          if (currentValues.includes(opt)) {
            handleAnswer(
              question.id,
              currentValues.filter((v) => v !== opt),
            );
          } else {
            handleAnswer(question.id, [...currentValues, opt]);
          }
        };
        return (
          <div className="form-options">
            {question.options?.map((opt) => (
              <label key={opt} className="form-option-label">
                <input
                  type="checkbox"
                  checked={currentValues.includes(opt)}
                  onChange={() => handleCheckbox(opt)}
                />
                <span className="option-text">{opt}</span>
              </label>
            ))}
          </div>
        );
      default:
        return (
          <input
            className="rsvp-input"
            type="text"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          />
        );
    }
  }

  if (status === 'success') {
    return (
      <div className="app-domain rsvp-page">
        <div className="texts">
          <h1>You're in! 🎉</h1>
          <h3>We've received your RSVP. See you at SST Open House 2026!</h3>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="app-domain rsvp-page">
        <div className="texts">
          {visibleCurrentQuestion && (
            <div className="form-question">
              <label className="form-label">
                {visibleCurrentQuestion.label}
                {visibleCurrentQuestion.required && (
                  <span className="required-star"> *</span>
                )}
              </label>
              {visibleCurrentQuestion.description && (
                <p className="form-description">
                  <small>{visibleCurrentQuestion.description}</small>
                </p>
              )}
              {renderQuestionInput(visibleCurrentQuestion)}
              {errorMsg && <p className="form-error">{errorMsg}</p>}
            </div>
          )}

          <div className="form-nav-buttons">
            <div className="but-cont">
              {!isFirstQuestion && (
                <button
                  className="rsvp-button form-back-button"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              {isLastQuestion ? (
                <button className="rsvp-button" onClick={handleSubmitForm}>
                  Submit
                </button>
              ) : (
                <button className="rsvp-button" onClick={handleNext}>
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-domain rsvp-page">
      <div className="texts">
        <h1>
          <span>RSVP</span> for SST Open House 2026!
        </h1>
        <h3>
          Get ready for immersive experiences to help decide if SST is the
          school for you!
        </h3>
        {/* <form onSubmit={handleRSVP}>
            <input
                className="rsvp-input"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {status === 'error' && <p>{errorMsg}</p>}
            <div className="but-cont">
              <button className="rsvp-button" type="submit" disabled={status === 'loading'}>
                <h3>{status === 'loading' ? 'Submitting...' : 'RSVP NOW!'}</h3>
              </button>
            </div>
          </form> */}
        <div className="but-cont">
          <button className="rsvp-button" onClick={() => setShowForm(true)}>
            <h3>RSVP NOW!</h3>
          </button>
        </div>
      </div>
    </div>
  );
}

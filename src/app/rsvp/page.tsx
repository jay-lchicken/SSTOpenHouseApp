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
  const isLastQuestion =
    currentQuestionIndex === visibleQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  function handleAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (visibleCurrentQuestion?.required && !answers[visibleCurrentQuestion.id]) {
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
            type="email"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your email"
          />
        );
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your answer"
          />
        );
      case 'dropdown':
        return (
          <select
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
          <div>
            {question.options?.map((opt) => (
              <label key={opt} style={{ display: 'block', margin: '8px 0' }}>
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                />
                {' '}{opt}
              </label>
            ))}
            {question.otherOption && (
              <label style={{ display: 'block', margin: '8px 0' }}>
                <input
                  type="radio"
                  name={question.id}
                  value="Other"
                  checked={value === 'Other'}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                />
                {' '}Other
                {value === 'Other' && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    style={{ marginLeft: '10px' }}
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
          <div>
            {question.options?.map((opt) => (
              <label key={opt} style={{ display: 'block', margin: '8px 0' }}>
                <input
                  type="checkbox"
                  checked={currentValues.includes(opt)}
                  onChange={() => handleCheckbox(opt)}
                />
                {' '}{opt}
              </label>
            ))}
          </div>
        );
      default:
        return (
          <input
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
          <h3>
            We've received your RSVP. See you at SST Open House 2026!
          </h3>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="app-domain rsvp-page">
        <div className="texts">
          <h1>
            <span>{formData.formTitle}</span>
          </h1>
          <h3>
            Question {currentQuestionIndex + 1} of {visibleQuestions.length}
          </h3>

          {visibleCurrentQuestion && (
            <div>
              <label>
                {visibleCurrentQuestion.label}
                {visibleCurrentQuestion.required && (
                  <span style={{ color: 'red' }}> *</span>
                )}
              </label>
              {visibleCurrentQuestion.description && (
                <p>
                  <small>{visibleCurrentQuestion.description}</small>
                </p>
              )}
              {renderQuestionInput(visibleCurrentQuestion)}
              {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            {!isFirstQuestion && (
              <button onClick={handleBack} style={{ marginRight: '10px' }}>
                Back
              </button>
            )}
            {isLastQuestion ? (
              <button onClick={handleSubmitForm}>Submit</button>
            ) : (
              <button onClick={handleNext}>Proceed</button>
            )}
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
          <button
            className="rsvp-button"
            onClick={() => setShowForm(true)}
          >
            <h3>RSVP NOW!</h3>
          </button>
        </div>
      </div>
    </div>
  );
}
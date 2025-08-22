import React from 'react'

const StudyGuide = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">Study Guide: Agentic AI</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
        <p>
          Agentic AI refers to artificial intelligence systems that are capable of autonomous action, decision-making, and goal pursuit. Unlike traditional AI, which often follows predefined rules, agentic AI systems can perceive their environment, make choices, and adapt their behavior to achieve specific objectives.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Key Characteristics</h2>
        <ul className="list-disc pl-6">
          <li><strong>Autonomy:</strong> Ability to operate independently without constant human intervention.</li>
          <li><strong>Goal-Oriented:</strong> Designed to pursue specific objectives or tasks.</li>
          <li><strong>Adaptability:</strong> Can learn from experience and adjust strategies accordingly.</li>
          <li><strong>Perception:</strong> Capable of sensing and interpreting information from the environment.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Applications of Agentic AI</h2>
        <p>
          Agentic AI is used in a variety of fields, including robotics, autonomous vehicles, personal assistants, and smart manufacturing. For example, self-driving cars use agentic AI to navigate roads, avoid obstacles, and make real-time decisions.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Challenges and Considerations</h2>
        <p>
          While agentic AI offers significant benefits, it also raises important challenges. Ensuring safety, ethical decision-making, and transparency are critical. There is ongoing research into how to align agentic AI systems with human values and societal norms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Conclusion</h2>
        <p>
          Agentic AI represents a major step forward in artificial intelligence, enabling systems to act with greater independence and intelligence. As the technology evolves, it is essential to address the associated risks and ensure that agentic AI serves the best interests of humanity.
        </p>
      </section>
    </div>
  )
}

export default StudyGuide

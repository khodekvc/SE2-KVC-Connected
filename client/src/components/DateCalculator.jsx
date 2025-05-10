export function calculateAge(birthday) {
    const today = new Date()
    const birthDate = new Date(birthday)
    let years = today.getFullYear() - birthDate.getFullYear()
    let months = today.getMonth() - birthDate.getMonth()
  
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--
      months += 12
    }
  
    return { years: years.toString(), months: months.toString() }
  }
  
  
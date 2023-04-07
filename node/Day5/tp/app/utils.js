const students = require("./data/students");
const dayjs = require("dayjs");

function prettierDate(date) {
  return dayjs(date).format("DD/MM/YYYY");
}

const studentsFormattedDate = (students) => {
  return students.map((student) => {
    return {
      ...student,
      birth: prettierDate(student.birth),
    };
  });
};

module.exports = studentsFormattedDate;
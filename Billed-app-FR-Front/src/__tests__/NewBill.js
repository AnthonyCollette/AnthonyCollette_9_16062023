/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

const formData = new FormData()


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Tu vas devoir faire plusieurs tests avec besoin de connexion
    // utilise beforeEach

    test("Then if file format is not jpg, jpeg or png, file upload should be reset", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion

      const file = screen.getByTestId("file")
      const amount = screen.getByTestId("amount")
      const datepicker = screen.getByTestId("datepicker")
      const pct = screen.getByTestId("pct")
      const submit = screen.getByRole("button", { type: /submit/i })

      amount.value = "1000"
      pct.value = "10"
      datepicker.value = "2021-01-01"
      file.type === "exe"

      // set file
      const Justificatif = new File(["img"], "justificatif.pdf", {type: "application/pdf"})
      const btnChange = screen.getByTestId('file')

      fireEvent.change(btnChange, {target: [{files: [Justificatif]}]})


      btnChange.addEventListener("change", (e) => {

      })

    })
  })
})

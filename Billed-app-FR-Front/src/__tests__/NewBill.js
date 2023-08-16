/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor, onNavigate } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES } from "../constants/routes"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill']}})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = "<div id='root'></div>"
      router()
      // const root = document.createElement("div")
      // root.setAttribute("id", "root")
      // document.body.append(root)
      // router()
      // window.onNavigate(ROUTES_PATH['NewBill'])
    })

    test("Then if file format is not jpg, jpeg or png, file upload should be reset", () => {
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e))
      const btnChange = screen.getByTestId('file')
      const msgWarning = screen.getByTestId("warning")

      // Set incorrect file extension
      const justificatifFile = new File(["img"], "justificatif.pdf", { type: "application/pdf" })

      btnChange.addEventListener("change", handleChange)
      fireEvent.change(btnChange, { target: { files: [justificatifFile] } })

      expect(msgWarning.classList).not.toContain("hidden")

      // const html = NewBillUI()
      // document.body.innerHTML = html

      // const btnChange = screen.getByTestId('file')
      // const amount = screen.getByTestId("amount")
      // const justificatif = new File(["img"], "justificatif.pdf", { type: "application/pdf" })

      // amount.value = "1000"

      // fireEvent.change(btnChange, { target: [{ files: [justificatif] }] })

      // btnChange.addEventListener("change", (e) => {
      //   expect(amount.value).toBe("")
      // })
    })
    
    test("If form's data is correct, new bill is created, and we should navigate to Bills", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const type = screen.getByTestId("expense-type")
      const name = screen.getByTestId("expense-name")
      const date = screen.getByTestId("datepicker")
      const amount = screen.getByTestId("amount")
      const vat = screen.getByTestId("vat")
      const pct = screen.getByTestId("pct")
      const commentary = screen.getByTestId("commentary")
      const fileUploader = screen.getByTestId("file")
      const btnSubmit = screen.getByText("Envoyer")
      const userbills = await mockStore.bills().list()
      const billsLength = userbills.length

      type.value = "Rent"
      name.value = "Nom"
      date.value = "2021-01-01"
      amount.value = "1000"
      vat.value = "10"
      pct.value = "10"
      commentary.value = "Commentaire"
      const file = new File(["img"], "justificatif.jpeg", { type: "image/jpeg" })

      await waitFor(() => {
        fileUploader,
        fireEvent.change(fileUploader, {
          target: {
            files: [file]
          }
        })
      })

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const handleChangeFile = jest.fn((e) => {
        newBill.handleChangeFile(e)
      })

      const handleSubmit = jest.fn((e) => {
        newBill.handleSubmit(e)
      })

      btnSubmit.addEventListener('click', handleChangeFile)
      btnSubmit.addEventListener('click', handleSubmit)
      userEvent.click(btnSubmit)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(handleSubmit).toHaveBeenCalled()
      await new Promise(process.nextTick(() => {
        expect(newBill.updateBill).toHaveBeenCalled()
        expect(userbills.length).toBe(billsLength + 1)
        expect(window.onNavigate(ROUTES_PATH['Bills'])).toBeTruthy()
      }))

    })
  })
})
